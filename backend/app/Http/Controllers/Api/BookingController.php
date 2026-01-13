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
                ->with(['trip.route.departurePort', 'trip.route.arrivalPort', 'tickets', 'transactions'])
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get();

            return $bookings->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_reference' => $booking->booking_reference,
                    'total_amount' => $booking->total_amount,
                    'status' => $booking->status,
                    'tickets_count' => $booking->tickets->count(),
                    'created_at' => $booking->created_at->toIso8601String(),
                    'trip' => $booking->trip ? [
                        'departure_time' => $booking->trip->departure_time,
                        'route_name' => $booking->trip->route ? ($booking->trip->route->departurePort->name . ' → ' . $booking->trip->route->arrivalPort->name) : 'Trajet maritime',
                        'departure_port' => $booking->trip->route->departurePort->name ?? '-',
                        'arrival_port' => $booking->trip->route->arrivalPort->name ?? '-',
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
                // Allow admin to bypass this check? If admin uses this route.
                // But admin has /admin/bookings/{id}.
                // Let's just return 403.
                return response()->json([
                    'message' => 'Accès non autorisé'
                ], 403);
            }
        }

        $booking->load(['tickets.trip.route.departurePort', 'tickets.trip.route.arrivalPort', 'tickets.trip.ship', 'transactions']);

        return response()->json([
            'data' => [
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
                        'return_trip_id' => $ticket->return_trip_id,
                        'trip' => [
                            'departure_time' => $ticket->trip->departure_time->toIso8601String(),
                            'route' => [
                                'name' => $ticket->trip->route->departurePort->name . ' → ' . $ticket->trip->route->arrivalPort->name,
                                'departure_port' => [
                                    'name' => $ticket->trip->route->departurePort->name
                                ],
                                'arrival_port' => [
                                    'name' => $ticket->trip->route->arrivalPort->name
                                ]
                            ],
                            'ship' => [
                                'name' => $ticket->trip->ship->name
                            ],
                        ],
                    ];
                }),
                'transactions' => $booking->transactions->map(function ($transaction) {
                    return [
                        'id' => $transaction->id,
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
            'return_trip_id' => 'nullable|exists:trips,id',
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

        try {
            DB::beginTransaction();

            // Verrouillage pessimiste pour éviter la sur-réservation
            $trip = Trip::where('id', $validated['trip_id'])->lockForUpdate()->firstOrFail();
            
            $returnTripId = $validated['return_trip_id'] ?? null;
            $returnTrip = null;
            if ($returnTripId) {
                // Pour éviter le deadlock, on trie les IDs si on devait verrouiller plusieurs ressources, 
                // mais ici c'est séquentiel simple.
                $returnTrip = Trip::where('id', $returnTripId)->lockForUpdate()->firstOrFail();
            }

            if ($trip->departure_time <= now()) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Ce voyage a déjà commencé ou est déjà parti.',
                ], 400);
            }
            
            if ($trip->available_seats_pax < count($validated['passengers'])) {
                DB::rollBack();
                return response()->json([
                    'message' => "Places insuffisantes pour l'aller",
                    'available' => $trip->available_seats_pax,
                    'requested' => count($validated['passengers'])
                ], 400);
            }

            if ($returnTrip && $returnTrip->available_seats_pax < count($validated['passengers'])) {
                DB::rollBack();
                return response()->json([
                    'message' => "Places insuffisantes pour le retour",
                    'available' => $returnTrip->available_seats_pax,
                    'requested' => count($validated['passengers'])
                ], 400);
            }

            if (!$user && $request->bearerToken()) {
                 $user = auth('sanctum')->user();
            }

            // Support pour admin qui réserve pour un client
            if ($user && $user->role === 'admin' && $request->has('user_id')) {
                $targetUser = \App\Models\User::find($request->user_id);
                if ($targetUser) {
                    $user = $targetUser;
                }
            }

            // Création de compte à la volée
            if (!$user && $request->input('create_account')) {
                $user = \App\Models\User::create([
                    'name' => $request->input('passenger_name_for_account') ?? $validated['passengers'][0]['name'],
                    'email' => $request->input('email'),
                    'password' => \Illuminate\Support\Facades\Hash::make($request->input('password')),
                    'phone' => $request->input('phone'),
                    'role' => 'client',
                ]);
                $user->assignRole('client');
            }

            // Vérifier l'abonnement si demandé
            $subscription = null;
            if ($request->has('subscription_id') && $user) {
                $subscription = \App\Models\Subscription::where('id', $validated['subscription_id'] ?? null)
                    ->lockForUpdate() // Verrouiller aussi l'abonnement
                    ->first();
                    
                if (!$subscription || $subscription->user_id !== $user->id) {
                    DB::rollBack();
                    return response()->json(['error' => 'Abonnement non autorisé'], 403);
                }
            }

            // Calculer d'abord le prix pour tous les passagers (Aller + Retour)
            $totalAmount = 0;
            $subscriptionDiscount = 0;
            $ticketsData = [];
            $subscriptionPassIndex = ($subscription) ? 0 : -1;
            
            // On crée un objet temporaire pour simuler les déductions
            // NOTE: Avec le lock, on peut modifier directement l'objet subscription chargé, 
            // mais on garde la logique de calcul séparée avant validation finale.
            $tempSubscription = $subscription ? clone $subscription : null;

            foreach ($validated['passengers'] as $index => $passenger) {
                $priceOut = ['total' => 0, 'found' => false];
                $priceIn = ['total' => 0, 'found' => false];

                // Prix Aller - Priorité au voyage
                $tripOutPrice = $this->findPriceInTrip($trip, $passenger['type'], $passenger['nationality_group']);
                
                if ($tripOutPrice !== null) {
                    $ticketPrice = $tripOutPrice;
                    $priceOut['total'] = $tripOutPrice; // Pour le calcul final_price plus bas
                } else {
                    $priceOut = $this->pricingService->calculatePrice(
                        $trip->route_id,
                        $passenger['type'],
                        $passenger['nationality_group']
                    );
                    
                    if (!$priceOut['found']) {
                        DB::rollBack();
                        return response()->json(['error' => "Aller: " . $priceOut['error']], 400);
                    }
                    $ticketPrice = $priceOut['total'];
                }

                // Prix Retour (si applicable) - Priorité au voyage retour
                if ($returnTrip) {
                    $tripInPrice = $this->findPriceInTrip($returnTrip, $passenger['type'], $passenger['nationality_group']);
                    if ($tripInPrice !== null) {
                        $ticketPrice += $tripInPrice;
                        $priceIn['total'] = $tripInPrice; // Pour le calcul final_price plus bas
                    } else {
                        $priceIn = $this->pricingService->calculatePrice(
                            $returnTrip->route_id,
                            $passenger['type'],
                            $passenger['nationality_group']
                        );
                        if (!$priceIn['found']) {
                            DB::rollBack();
                            return response()->json(['error' => "Retour: " . $priceIn['error']], 400);
                        }
                        $ticketPrice += $priceIn['total'];
                    }
                }
                
                // Déterminer si ce passager peut utiliser l'abonnement
                $canUseSubscription = false;
                if ($tempSubscription) {
                    if ($tempSubscription->plan->allow_multi_passenger) {
                        $canUseSubscription = true;
                    } elseif ($index === 0) {
                        // Uniquement le titulaire si multi-passager non autorisé
                        $canUseSubscription = true;
                    }
                }

                // Si ce passager est couvert par l'abonnement
                if ($canUseSubscription) {
                    $isRoundTrip = (bool)$returnTrip;
                    $creditsNeeded = $isRoundTrip ? 2 : 1;

                    if ($tempSubscription->plan && in_array($tempSubscription->plan->credit_type, ['unlimited', 'counted'])) {
                        if ($tempSubscription->canCoverTrips($creditsNeeded)) {
                            $ticketsData[$index]['uses_subscription_credit'] = true;
                            $ticketsData[$index]['credits_to_deduct'] = $creditsNeeded;
                            $subscriptionDiscount += $ticketPrice;
                            $ticketPrice = 0;
                            // On déduit virtuellement pour le prochain passager de la boucle
                            if ($tempSubscription->plan->credit_type === 'counted') {
                                $tempSubscription->voyage_credits_remaining -= $creditsNeeded;
                            }
                        } else {
                            // If subscription cannot cover, it means it's insufficient, so this passenger pays full price.
                            // No need to rollback here, just proceed with full price.
                        }
                    } 
                    else {
                        if ($tempSubscription->canCoverAmount($ticketPrice)) {
                            $ticketsData[$index]['uses_subscription_credit'] = false;
                            $subscriptionDiscount += $ticketPrice;
                            $priceUsed = $ticketPrice;
                            $ticketPrice = 0;
                            // On déduit virtuellement pour le prochain passager de la boucle
                            $tempSubscription->legacy_credit_fcfa -= $priceUsed;
                        } else {
                            // If subscription cannot cover, it means it's insufficient, so this passenger pays full price.
                        }
                    }
                }

                $totalAmount += $ticketPrice;
                $ticketsData[$index]['passenger'] = $passenger;
                $ticketsData[$index]['price'] = $priceOut['total'] + ($returnTrip ? $priceIn['total'] : 0);
                $ticketsData[$index]['final_price'] = $ticketPrice;
                $ticketsData[$index]['paid_via_subscription'] = ($ticketPrice === 0 && $subscription);
                $ticketsData[$index]['uses_subscription_credit'] = $ticketsData[$index]['uses_subscription_credit'] ?? false;
                $ticketsData[$index]['credits_to_deduct'] = $ticketsData[$index]['credits_to_deduct'] ?? 0;
            }

            $userIdToSave = ($user && isset($user->id)) ? $user->id : null;

            $booking = Booking::create([
                'user_id' => $userIdToSave,
                'trip_id' => $trip->id,
                'booking_reference' => strtoupper(\Illuminate\Support\Str::random(8)),
                'total_amount' => $totalAmount,
                'status' => 'confirmed',
            ]);

            // Créer les tickets (un seul ticket par passager, même en aller-retour)
            foreach ($ticketsData as $data) {
                Ticket::create([
                    'booking_id' => $booking->id,
                    'trip_id' => $trip->id,
                    'return_trip_id' => $returnTrip ? $returnTrip->id : null,
                    'passenger_name' => $data['passenger']['name'],
                    'passenger_type' => $data['passenger']['type'],
                    'nationality_group' => $data['passenger']['nationality_group'],
                    'price_paid' => $data['final_price'],
                    'status' => 'issued',
                    'qr_code_data' => 'TKT-' . strtoupper(\Illuminate\Support\Str::random(12)),
                ]);
            }

            // Gérer les transactions et l'abonnement
            if ($subscription && $subscriptionDiscount > 0) {
                $totalCreditsUsed = collect($ticketsData)->sum('credits_to_deduct');
                $externalRef = 'SUB-' . $subscription->id;
                
                if ($totalCreditsUsed > 0) {
                    $subscription->deductTripCredits($totalCreditsUsed);
                    $externalRef .= '-CREDITS-' . $totalCreditsUsed;
                } else {
                    $subscription->deductAmount($subscriptionDiscount);
                }

                Transaction::create([
                    'booking_id' => $booking->id,
                    'amount' => $subscriptionDiscount,
                    'payment_method' => 'subscription',
                    'status' => 'completed',
                    'external_reference' => $externalRef,
                ]);
            }
            
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

            // Réduire la capacité pour les deux trajets
            $trip->decrement('available_seats_pax', count($validated['passengers']));
            if ($returnTrip) {
                $returnTrip->decrement('available_seats_pax', count($validated['passengers']));
            }

            DB::commit();

            // Invalider le cache des réservations de l'utilisateur
            if ($user && isset($user->id)) {
                \Illuminate\Support\Facades\Cache::forget("user_bookings_{$user->id}");
            }

            // Envoi de l'email de confirmation
            $recipientEmail = $request->input('email') ?? ($user ? $user->email : null);
            if ($recipientEmail) {
                try {
                    // On charge les relations nécessaires pour l'email
                    $booking->load(['trip.route.departurePort', 'trip.route.arrivalPort', 'trip.ship', 'tickets']);
                    \Illuminate\Support\Facades\Mail::to($recipientEmail)->queue(new \App\Mail\BookingConfirmed($booking));
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error("Erreur envoi email booking {$booking->id}: " . $e->getMessage());
                }
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
            
            \Illuminate\Support\Facades\Log::error('Erreur réservation: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'user_id' => $user ? $user->id : 'guest',
                'data' => $validated
            ]);

            return response()->json([
                'message' => 'Une erreur est survenue lors du traitement de votre réservation. Veuillez réessayer.',
            ], 500);
        }
}

    /**
     * Télécharger les billets en PDF
     */
    public function downloadPdf(Booking $booking)
    {
        // Vérification de sécurité améliorée
        // 1. Si la réservation appartient à un utilisateur enregistré, il DOIT être authentifié et être le propriétaire (ou admin).
        if ($booking->user_id !== null) {
            $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user();
            if (!$user || ($booking->user_id !== $user->id && $user->role !== 'admin')) {
                return response()->json(['message' => 'Non autorisé'], 403);
            }
        }
        
        // 2. Si la réservation est "invité" (user_id === null), on autorise le téléchargement 
        // car l'utilisateur possède l'URL avec l'UUID qui fait office de jeton de sécurité.
        // C'est le comportement standard pour les e-billets.

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
            'data' => $booking
        ]);
    }

    /**
     * Tente de trouver un prix dans les réglages spécifiques du voyage
     */
    private function findPriceInTrip(Trip $trip, string $type, string $nationality): ?float
    {
        $settings = $trip->pricing_settings;
        if (!$settings || !isset($settings['categories'])) {
            return null;
        }

        $type = strtoupper($type); // adult -> ADULT
        if ($type === 'BABY') $type = 'CHILD';

        foreach ($settings['categories'] as $category) {
            if ($category['type'] === $type) {
                $name = strtolower($category['name']);
                
                // Matching par mots clés
                if ($nationality === 'national' || $nationality === 'resident') {
                    if (str_contains($name, 'sénégal') || str_contains($name, 'national') || str_contains($name, 'résident')) {
                        return (float) $category['price'];
                    }
                } elseif ($nationality === 'african') {
                    if (str_contains($name, 'afrique')) {
                        return (float) $category['price'];
                    }
                } elseif ($nationality === 'hors_afrique') {
                    if (str_contains($name, 'non résident') || str_contains($name, 'international') || str_contains($name, 'hors')) {
                        return (float) $category['price'];
                    }
                }
            }
        }

        // Deuxième passe: premier match par type si rien trouvé de spécifique
        foreach ($settings['categories'] as $category) {
            if ($category['type'] === $type) {
                return (float) $category['price'];
            }
        }

        return null;
    }

    /**
     * Annuler une réservation
     */
    public function cancel(Request $request, Booking $booking): JsonResponse
    {
        // 1. Vérification des droits
        $user = $request->user();
        if ($booking->user_id !== $user->id && $user->role !== 'admin') {
             return response()->json(['message' => 'Non autorisé'], 403);
        }

        // 2. Vérification statut
        if ($booking->status === 'cancelled') {
             return response()->json(['message' => 'Réservation déjà annulée'], 400);
        }

        // Ne pas annuler si le voyage est passé (sauf admin ?)
        // On charge le voyage pour vérifier
        $trip = $booking->trip;
        if ($trip && $trip->departure_time <= now() && $user->role !== 'admin') {
             return response()->json(['message' => 'Impossible d\'annuler un voyage passé ou en cours'], 400);
        }

        try {
            DB::beginTransaction();

            // Verrouiller le trip pour mettre à jour la capacité
            // Note: On recharge le trip avec lock
            $tripLocked = Trip::where('id', $booking->trip_id)->lockForUpdate()->first();

            // Mettre à jour le statut
            $booking->update(['status' => 'cancelled']);
            $booking->tickets()->update(['status' => 'cancelled']);

            // Restaurer la capacité
            // On compte combien de tickets étaient valides
            $seatsToRestore = $booking->tickets->count();
            
            if ($tripLocked) {
                $tripLocked->increment('available_seats_pax', $seatsToRestore);
            }
            
            // Si retour, restaurer aussi (si c'était un A/R)
            $uniqueReturnTripIds = $booking->tickets->pluck('return_trip_id')->filter()->unique();
            foreach ($uniqueReturnTripIds as $rId) {
                $rTrip = Trip::where('id', $rId)->lockForUpdate()->first();
                if ($rTrip) {
                    $count = $booking->tickets->where('return_trip_id', $rId)->count();
                    $rTrip->increment('available_seats_pax', $count);
                }
            }

            // Gestion du remboursement (Simulé ici)
            Transaction::create([
                'booking_id' => $booking->id,
                'amount' => -$booking->total_amount,
                'payment_method' => 'system', // Refund
                'status' => 'pending', // A traiter manuellement ou job async
                'external_reference' => 'REF-' . strtoupper(\Illuminate\Support\Str::random(10)),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Réservation annulée avec succès',
                'status' => 'cancelled'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Erreur annulation: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors de l\'annulation'], 500);
        }
    }
}
