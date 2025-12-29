<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Ticket;
use App\Models\Transaction;
use App\Models\Trip;
use App\Services\PricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    protected $pricingService;

    public function __construct(PricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    /**
     * Liste des réservations de l'utilisateur authentifié
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $cacheKey = "user_bookings_{$userId}";
        
        $result = \Illuminate\Support\Facades\Cache::remember($cacheKey, 300, function () use ($userId) {
            $bookings = Booking::where('user_id', $userId)
                ->with(['tickets.trip.route.departurePort', 'tickets.trip.route.arrivalPort', 'transactions'])
                ->orderBy('created_at', 'desc')
                ->limit(50) // Limiter à 50 dernières réservations
                ->get();

            return $bookings->map(function ($booking) {
                $firstTicket = $booking->tickets->first();
                return [
                    'id' => $booking->id,
                    'booking_reference' => $booking->booking_reference,
                    'total_amount' => $booking->total_amount,
                    'status' => $booking->status,
                    'tickets_count' => $booking->tickets->count(),
                    'created_at' => $booking->created_at->toIso8601String(),
                    'trip' => $firstTicket ? [
                        'departure_time' => $firstTicket->trip->departure_time,
                        'route_name' => $firstTicket->trip->route->departurePort->name . ' → ' . $firstTicket->trip->route->arrivalPort->name,
                        'departure_port' => $firstTicket->trip->route->departurePort->name,
                        'arrival_port' => $firstTicket->trip->route->arrivalPort->name,
                    ] : null
                ];
            });
        });

        return response()->json([
            'bookings' => $result
        ]);
    }

    /**
     * Détails d'une réservation
     */
    public function show(Request $request, Booking $booking): JsonResponse
    {
        // Si la réservation appartient à un utilisateur, on vérifie l'accès
        if ($booking->user_id !== null) {
            $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user();
            if (!$user || $booking->user_id !== $user->id) {
                return response()->json([
                    'message' => 'Accès non autorisé'
                ], 403);
            }
        }

        $booking->load(['tickets.trip.route.departurePort', 'tickets.trip.route.arrivalPort', 'tickets.trip.ship', 'transactions']);

        return response()->json([
            'booking' => [
                'id' => $booking->id,
                'booking_reference' => $booking->booking_reference,
                'total_amount' => $booking->total_amount,
                'status' => $booking->status,
                'created_at' => $booking->created_at->toIso8601String(),
                'tickets' => $booking->tickets->map(function ($ticket) {
                    return [
                        'id' => $ticket->id,
                        'passenger_name' => $ticket->passenger_name,
                        'passenger_type' => $ticket->passenger_type,
                        'nationality_group' => $ticket->nationality_group,
                        'price_paid' => $ticket->price_paid,
                        'status' => $ticket->status,
                        'qr_code_data' => $ticket->qr_code_data,
                        'trip' => [
                            'departure_time' => $ticket->trip->departure_time->toIso8601String(),
                            'route' => $ticket->trip->route->departurePort->name . ' → ' . $ticket->trip->route->arrivalPort->name,
                            'ship' => $ticket->trip->ship->name,
                        ],
                    ];
                }),
                'transactions' => $booking->transactions->map(function ($transaction) {
                    return [
                        'amount' => $transaction->amount,
                        'payment_method' => $transaction->payment_method,
                        'status' => $transaction->status,
                        'created_at' => $transaction->created_at->toIso8601String(),
                    ];
                }),
            ]
        ]);
    }

    /**
     * Créer une nouvelle réservation
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'trip_id' => 'required|exists:trips,id',
            'passengers' => 'required|array|min:1|max:10',
            'passengers.*.name' => 'required|string|max:255',
            'passengers.*.type' => 'required|in:adult,child,baby',
            'passengers.*.nationality_group' => 'required|in:national,resident,african,hors_afrique',
            'payment_method' => 'required|in:cash,card,orange_money,wave,free_money,mobile_money,wallet,subscription',
            'subscription_id' => 'nullable|string|exists:subscriptions,id',
            'create_account' => 'boolean',
            'password' => 'nullable|string|min:6|required_if:create_account,true',
            'email' => 'nullable|email|required_if:create_account,true',
            'phone' => 'nullable|string|required_if:create_account,true',
            'passenger_name_for_account' => 'nullable|string',
        ]);


        // Vérifier si un utilisateur est authentifié
        $user = $request->user();
        if (!$user && $request->bearerToken()) {
            $user = auth('sanctum')->user();
        }

        // Ne vérifier l'existence de l'email QUE si l'utilisateur n'est PAS connecté ET veut créer un compte
        if (!$user && $request->input('create_account') && \App\Models\User::where('email', $request->input('email'))->exists()) {
             return response()->json([
                'message' => 'Un compte existe déjà avec cet email. Veuillez vous connecter.',
            ], 422);
        }

        // Vérifier disponibilité
        $trip = Trip::findOrFail($validated['trip_id']);
        
        if ($trip->departure_time <= now()) {
            return response()->json([
                'message' => 'Ce voyage a déjà commencé ou est déjà parti.',
            ], 400);
        }
        
        if ($trip->available_seats_pax < count($validated['passengers'])) {
            return response()->json([
                'message' => 'Places insuffisantes',
                'available' => $trip->available_seats_pax,
                'requested' => count($validated['passengers'])
            ], 400);
        }

        try {
            DB::beginTransaction();

            $user = $request->user();

            // Si la route est publique, $request->user() peut être null même avec un token.
            // On tente de récupérer l'utilisateur via Sanctum explicitement.
            if (!$user && $request->bearerToken()) {
                 $user = auth('sanctum')->user();
            }

            // Création de compte à la volée
            if (!$user && $request->input('create_account')) {
                $user = \App\Models\User::create([
                    'name' => $request->input('passenger_name_for_account') ?? $validated['passengers'][0]['name'], // Utilise le nom du premier passager ou le nom fourni
                    'email' => $request->input('email'),
                    'password' => \Illuminate\Support\Facades\Hash::make($request->input('password')),
                    'phone' => $request->input('phone'),
                    'role' => 'client',
                ]);
                $user->assignRole('client');
                // TODO: Envoyer email de bienvenue / vérification
            }

            // Vérifier l'abonnement si demandé
            $subscription = null;
            
            if ($request->has('subscription_id') && $user) {
                $subscription = \App\Models\Subscription::find($validated['subscription_id']);
                
                // Vérifier que l'abonnement appartient à l'utilisateur
                if (!$subscription || $subscription->user_id !== $user->id) {
                    DB::rollBack();
                    return response()->json([
                        'error' => 'Abonnement non autorisé'
                    ], 403);
                }
            }

            // Calculer d'abord le prix pour tous les passagers
            $totalAmount = 0;
            $subscriptionDiscount = 0;
            $ticketsData = [];
            $subscriptionPassIndex = -1; // Index du passager couvert par l'abonnement (par défaut aucun)

            // On identifie qui est couvert par l'abonnement (par défaut le premier passager, qui est le titulaire)
            // TODO: Permettre de choisir quel passager est couvert si nécessaire
            if ($subscription) {
                $subscriptionPassIndex = 0;
            }

            foreach ($validated['passengers'] as $index => $passenger) {
                $priceData = $this->pricingService->calculatePrice(
                    $trip->route_id,
                    $passenger['type'],
                    $passenger['nationality_group']
                );

                if (!$priceData['found']) {
                    DB::rollBack();
                    return response()->json(['error' => $priceData['error']], 400);
                }

                $ticketPrice = $priceData['total'];
                
                // Si ce passager est couvert par l'abonnement
                if ($index === $subscriptionPassIndex && $subscription) {
                    
                    // NOUVEAU SYSTÈME : Crédits Voyage (ou Illimité)
                    if ($subscription->plan && in_array($subscription->plan->credit_type, ['unlimited', 'counted'])) {
                        if (!$subscription->canCoverTrips(1)) {
                             DB::rollBack();
                             return response()->json([
                                 'error' => "Crédits voyage insuffisants. Restants : {$subscription->voyage_credits_remaining}"
                             ], 400);
                        }
                        // Marquer pour déduction de crédits
                        $ticketsData[$index]['uses_subscription_credit'] = true;
                    } 
                    // ANCIEN SYSTÈME : Solde FCFA (Legacy)
                    else {
                        // On vérifie le solde maintenant qu'on connait le prix
                        if (!$subscription->canCoverAmount($ticketPrice)) {
                             DB::rollBack();
                             return response()->json([
                                 'error' => "Solde d'abonnement insuffisant pour couvrir le billet ({$ticketPrice} FCFA)"
                             ], 400);
                        }
                        // Marquer pour déduction FCFA
                        $ticketsData[$index]['uses_subscription_credit'] = false;
                    }

                    $subscriptionDiscount = $ticketPrice; // Le montant débité (valeur comptable)
                    $ticketPrice = 0; // Le client ne paie rien directement pour ce billet
                }

                $totalAmount += $ticketPrice;
                $ticketsData[] = [
                    'passenger' => $passenger,
                    'price' => $priceData['total'], // Prix réel du billet
                    'final_price' => $ticketPrice,  // Prix payé par le client
                    'paid_via_subscription' => ($index === $subscriptionPassIndex && $subscription),
                    'uses_subscription_credit' => ($index === $subscriptionPassIndex && $subscription) ? ($ticketsData[$index]['uses_subscription_credit'] ?? false) : false
                ];
            }

            // Créer la réservation
            // CRITICAL: On force l'utilisation de l'ID utilisateur s'il est disponible
            $userIdToSave = null;
            if ($user && isset($user->id)) {
                $userIdToSave = $user->id;
            }

            $booking = Booking::create([
                'user_id' => $userIdToSave,
                'booking_reference' => strtoupper(\Illuminate\Support\Str::random(8)),
                'total_amount' => $totalAmount,
                'status' => 'confirmed', // Marqué comme confirmé après paiement
            ]);

            // Créer les tickets
            foreach ($ticketsData as $data) {
                Ticket::create([
                    'booking_id' => $booking->id,
                    'trip_id' => $trip->id,
                    'passenger_name' => $data['passenger']['name'],
                    'passenger_type' => $data['passenger']['type'],
                    'nationality_group' => $data['passenger']['nationality_group'],
                    'price_paid' => $data['final_price'], // Ce que le client a payé
                    'status' => 'issued',
                    'qr_code_data' => 'TKT-' . strtoupper(\Illuminate\Support\Str::random(12)), // Unique placeholder
                ]);
            }

            // Créer les transactions et débiter l'abonnement
            if ($subscription && $subscriptionDiscount > 0) {
                $creditsUsed = collect($ticketsData)->where('uses_subscription_credit', true)->count();
                $externalRef = 'SUB-' . $subscription->id;
                
                if ($creditsUsed > 0) {
                    // Nouveau système : déduire crédits
                    $subscription->deductTripCredits($creditsUsed);
                    $externalRef .= '-CREDITS-' . $creditsUsed;
                } else {
                    // Ancien système : déduire montant
                    $subscription->deductAmount($subscriptionDiscount);
                }

                // Transaction pour la partie abonnement (interne)
                Transaction::create([
                    'booking_id' => $booking->id,
                    'amount' => $subscriptionDiscount,
                    'payment_method' => 'subscription',
                    'status' => 'completed',
                    'external_reference' => $externalRef,
                ]);
            }
            

            
            // Transaction pour le paiement classique (si montant > 0)
            $classicTransaction = null;
            if ($totalAmount > 0) {
                $classicTransaction = Transaction::create([
                    'booking_id' => $booking->id,
                    'amount' => $totalAmount,
                    'payment_method' => $validated['payment_method'],
                    'status' => 'completed',
                    'external_reference' => 'TXN-' . strtoupper(\Illuminate\Support\Str::random(10)),
                ]);
            }

            // Réduire la capacité
            $trip->decrement('available_seats_pax', count($validated['passengers']));

            DB::commit();

            // Invalider le cache des réservations de l'utilisateur
            if ($user && isset($user->id)) {
                \Illuminate\Support\Facades\Cache::forget("user_bookings_{$user->id}");
            }

            $token = null;
            if (!$request->user() && $request->input('create_account') && $user) {
                $token = $user->createToken('booking_token')->plainTextToken;
            }
            
            // Référence de transaction à afficher
            $txnRef = $classicTransaction ? $classicTransaction->external_reference : 'ABONNEMENT';

            return response()->json([
                'message' => 'Réservation créée avec succès',
                'booking' => [
                    'id' => $booking->id,
                    'booking_reference' => $booking->booking_reference,
                    'total_amount' => $booking->total_amount,
                    'status' => $booking->status,
                ],
                'payment' => [
                    'amount' => $totalAmount,
                    'method' => $validated['payment_method'],
                    'transaction_reference' => $txnRef,
                ],
                'token' => $token,
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ] : null
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Erreur lors de la création de la réservation',
                'error' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
}

    /**
     * Télécharger les billets en PDF
     */
    public function downloadPdf(Booking $booking)
    {
        // Vérification de sécurité (Propriétaire ou Admin)
        $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user();
        if ($booking->user_id !== null) {
            if (!$user || ($booking->user_id !== $user->id && !$user->hasRole('admin'))) {
                return response()->json(['message' => 'Non autorisé'], 403);
            }
        }

        $booking->load(['tickets.trip.route.departurePort', 'tickets.trip.route.arrivalPort', 'tickets.trip.ship']);

        $ticketsData = [];
        foreach ($booking->tickets as $ticket) {
            // Générer QR Code en SVG (plus léger et ne nécessite pas Imagick)
            $qrCode = \SimpleSoftwareIO\QrCode\Facades\QrCode::size(200)
                ->margin(1)
                ->generate($ticket->qr_code_data ?? $booking->booking_reference);
            
            $ticketsData[] = [
                'model' => $ticket,
                'qr_code' => 'data:image/svg+xml;base64,' . base64_encode($qrCode)
            ];
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.ticket', [
            'booking' => $booking,
            'tickets' => $ticketsData
        ]);

        return $pdf->download("billet-{$booking->booking_reference}.pdf");
    }

    /**
     * Récupérer les détails d'une réservation publiquement par sa référence
     */
    public function showPublic($reference)
    {
        $booking = Booking::where('booking_reference', $reference)
            ->with(['tickets.trip.route.departurePort', 'tickets.trip.route.arrivalPort', 'tickets.trip.ship'])
            ->firstOrFail();

        return response()->json([
            'booking' => $booking
        ]);
    }
}
