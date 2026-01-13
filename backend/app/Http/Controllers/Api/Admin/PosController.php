<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Ticket;
use App\Models\Transaction;
use App\Models\Trip;
use App\Models\User;
use App\Services\PricingService;
use App\Services\QrScanService;
use App\Models\CashSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PosController extends Controller
{
    protected $pricingService;

    public function __construct(PricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    /**
     * Effectuer une vente directe en caisse
     */
    public function sale(Request $request): JsonResponse
    {
        // Vérifier la permission
        if (!$request->user()->can('pos.sale')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'trip_id' => 'required|exists:trips,id',
            'user_id' => 'nullable|exists:users,id',
            'cash_desk_id' => 'nullable|exists:cash_desks,id',
            'passengers' => 'required|array|min:1',
            'passengers.*.name' => 'required|string',
            'passengers.*.type' => 'required|in:adult,child,baby',
            'passengers.*.nationality_group' => 'required|in:national,resident,african,hors_afrique',
            'passengers.*.price' => 'nullable|numeric',
            'payment_method' => 'required|in:cash,card,wave,orange_money',
            'total_amount' => 'required|numeric',
        ]);

        // 0. Vérifier si une session de caisse est ouverte
        $session = CashSession::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->first();

        if (!$session) {
            return response()->json(['message' => 'Aucune session de caisse ouverte. Veuillez ouvrir votre caisse.'], 403);
        }

        $trip = Trip::with('route.departurePort', 'route.arrivalPort')->findOrFail($validated['trip_id']);

        if ($trip->available_seats_pax < count($validated['passengers'])) {
            return response()->json(['message' => 'Places insuffisantes'], 400);
        }

        try {
            DB::beginTransaction();

            // 1. Créer ou identifier l'utilisateur
            $userId = $validated['user_id'] ?? null;
            
            // 2. Créer la réservation
            $booking = Booking::create([
                'user_id' => $userId,
                'trip_id' => $trip->id,
                'cash_desk_id' => $validated['cash_desk_id'] ?? $request->user()->cash_desk_id,
                'booking_reference' => 'POS-' . strtoupper(Str::random(6)),
                'total_amount' => $validated['total_amount'],
                'status' => 'confirmed',
                'cash_session_id' => $session->id,
            ]);

            // 3. Créer les tickets
            foreach ($validated['passengers'] as $passenger) {
                // Utiliser le prix envoyé par le POS ou par défaut une répartition (fallback)
                $pricePaid = $passenger['price'] ?? ($validated['total_amount'] / count($validated['passengers']));
                
                $ticket = Ticket::create([
                    'booking_id' => $booking->id,
                    'trip_id' => $trip->id,
                    'passenger_name' => $passenger['name'],
                    'passenger_type' => $passenger['type'],
                    'nationality_group' => $passenger['nationality_group'],
                    'price_paid' => $pricePaid,
                    'status' => 'issued',
                    'ticket_number' => 'T-' . strtoupper(Str::random(8)),
                    'qr_code_data' => 'V1|TEMP|' . $booking->booking_reference . '|' . $trip->id . '|HASH',
                ]);

                // Mettre à jour le vrai QR data avec l'ID du ticket
                $qrService = app(QrScanService::class);
                $hash = hash_hmac('sha256', $ticket->id . $booking->booking_reference, config('app.key'));
                $ticket->update([
                    'qr_code_data' => 'V1|' . $ticket->id . '|' . $booking->booking_reference . '|' . $trip->id . '|' . substr($hash, 0, 8)
                ]);
            }

            // 4. Créer la transaction complétée
            Transaction::create([
                'booking_id' => $booking->id,
                'amount' => $validated['total_amount'],
                'payment_method' => $validated['payment_method'],
                'status' => 'completed',
                'external_reference' => 'POS-CASH-' . time(),
            ]);

            // 5. Déduire les places
            $trip->decrement('available_seats_pax', count($validated['passengers']));

            // 6. Mettre à jour l'attendu de la session
            $session->increment('expected_amount', $validated['total_amount']);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Vente enregistrée avec succès',
                'booking' => $booking->load(['tickets', 'user'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la vente: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Rechercher un client pour le POS
     */
    public function searchCustomer(Request $request): JsonResponse
    {
        $q = $request->query('q');
        if (strlen($q) < 2) return response()->json([]);

        $users = User::where(function($query) use ($q) {
                $query->where('name', 'like', "{$q}%")
                      ->orWhere('phone', 'like', "{$q}%")
                      ->orWhere('email', 'like', "{$q}%");
            })
            ->limit(10)
            ->get(['id', 'name', 'email', 'phone']);

        return response()->json($users);
    }

    /**
     * Créer un nouveau client depuis le POS
     */
    public function storeCustomer(Request $request): JsonResponse
    {
        if (!$request->user()->can('pos.access')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|unique:users,email',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? 'guest_' . Str::random(8) . '@maritime.sn',
            'password' => bcrypt('password'), // Mot de passe par défaut
            'role' => 'client',
        ]);

        $user->assignRole('client');

        return response()->json([
            'status' => 'success',
            'data' => $user
        ]);
    }

    /**
     * Ouvrir une session de caisse
     */
    public function startSession(Request $request): JsonResponse
    {
        if (!$request->user()->can('pos.access')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'opening_amount' => 'required|numeric|min:0',
            'cash_desk_id' => 'required|exists:cash_desks,id',
        ]);

        // Vérifier si une session est déjà ouverte
        $existing = CashSession::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Une session est déjà ouverte'], 400);
        }

        $session = CashSession::create([
            'user_id' => $request->user()->id,
            'cash_desk_id' => $validated['cash_desk_id'],
            'opening_amount' => $validated['opening_amount'],
            'expected_amount' => $validated['opening_amount'],
            'status' => 'open',
            'opened_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'session' => $session
        ]);
    }

    /**
     * Fermer une session de caisse
     */
    public function closeSession(Request $request): JsonResponse
    {
        if (!$request->user()->can('pos.session.close')) {
            return response()->json(['message' => 'Non autorisé à clôturer la caisse'], 403);
        }

        $validated = $request->validate([
            'closing_amount_declared' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $session = CashSession::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->first();

        if (!$session) {
            return response()->json(['message' => 'Aucune session ouverte'], 404);
        }

        $expected = $session->expected_amount;
        $declared = $validated['closing_amount_declared'];
        $discrepancy = $declared - $expected;

        // Calculer les statistiques pour le rapport Z (optimisé avec requêtes agrégées)
        $bookingsCount = \App\Models\Booking::where('cash_session_id', $session->id)->count();
        
        $ticketsCount = \App\Models\Ticket::whereIn(
            'booking_id',
            \App\Models\Booking::where('cash_session_id', $session->id)->select('id')
        )->count();
        
        $cashAmount = \App\Models\Booking::where('cash_session_id', $session->id)
            ->where('payment_method', 'cash')
            ->sum('total_amount');
            
        $cardAmount = \App\Models\Booking::where('cash_session_id', $session->id)
            ->whereIn('payment_method', ['card', 'om', 'wave', 'orange_money'])
            ->sum('total_amount');

        $stats = [
            'bookings_count' => $bookingsCount,
            'tickets_count' => $ticketsCount,
            'payments' => [
                'cash' => (float) $cashAmount,
                'card' => (float) $cardAmount,
            ]
        ];

        $session->update([
            'closing_amount_declared' => $declared,
            'discrepancy_amount' => $discrepancy,
            'status' => 'closed',
            'closed_at' => now(),
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'status' => 'success',
            'session' => $session,
            'summary' => array_merge([
                'expected' => $expected,
                'declared' => $declared,
                'discrepancy' => $discrepancy
            ], $stats)
        ]);
    }

    /**
     * Vendre un abonnement ou un badge RFID
     */
    public function saleSubscription(Request $request): JsonResponse
    {
        if (!$request->user()->can('pos.subscription.sale')) {
            return response()->json(['message' => 'Non autorisé à vendre des abonnements'], 403);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'plan_id' => 'required|exists:subscription_plans,id',
            'payment_method' => 'required|in:cash,card,om,wave',
            'rfid_card_id' => 'nullable|string',
        ]);

        // 1. Vérifier la session
        $session = CashSession::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->first();

        if (!$session) {
            return response()->json(['message' => 'Aucune session de caisse ouverte.'], 403);
        }

        $plan = SubscriptionPlan::findOrFail($validated['plan_id']);

        try {
            DB::beginTransaction();

            // 2. Créer l'abonnement
            $subscription = \App\Models\Subscription::create([
                'user_id' => $validated['user_id'],
                'plan_id' => $plan->id,
                'rfid_card_id' => $validated['rfid_card_id'],
                'start_date' => now(),
                'end_date' => now()->addDays($plan->duration_days),
                'status' => 'active',
                'voyage_credits_initial' => $plan->voyage_credits,
                'voyage_credits_remaining' => $plan->voyage_credits,
                // 'cash_session_id' => $session->id, // On pourrait ajouter ce champ à la table subscriptions plus tard
            ]);

            // 3. Mettre à jour l'attendu de la session
            $session->increment('expected_amount', $plan->price);

            // 4. Créer une transaction (Optionnel mais recommandé pour la traçabilité)
            // 4. Créer une transaction (Optionnel mais recommandé pour la traçabilité)
            // \App\Models\Transaction::create([
            //     'user_id' => $validated['user_id'],
            //     'amount' => $plan->price,
            //     'type' => 'subscription_purchase',
            //     'payment_method' => $validated['payment_method'],
            //     'status' => 'completed',
            //     'reference' => 'SUB-' . $subscription->id,
            // ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Abonnement activé avec succès',
                'subscription' => $subscription->load('plan', 'user')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la vente d\'abonnement: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Vérifier le statut de la session actuelle
     */
    public function sessionStatus(Request $request): JsonResponse
    {
        $session = CashSession::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->with('cashDesk')
            ->first();

        return response()->json([
            'has_active_session' => !!$session,
            'session' => $session
        ]);
    }
}
