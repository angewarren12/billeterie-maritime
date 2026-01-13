<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Services\PricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TripController extends Controller
{
    protected $pricingService;

    public function __construct(PricingService $pricingService)
    {
        $this->pricingService = $pricingService;
    }

    /**
     * Recherche de traversées disponibles
     * 
     * Query params:
     * - route_id: ID du trajet (optionnel)
     * - date: Date de départ (YYYY-MM-DD, optionnel)
     * - min_capacity: Capacité minimale disponible (optionnel)
     */
    public function search(Request $request): JsonResponse
    {
        // Génération d'une clé de cache unique basée sur les paramètres de recherche
        $cacheKey = 'trips_search_' . md5(json_encode($request->all()));

        $result = \Illuminate\Support\Facades\Cache::remember($cacheKey, 300, function() use ($request) {
            $query = Trip::query();

            // Filtre par statut (supporte plusieurs statuts séparés par des virgules)
            if ($request->has('status')) {
                $statuses = explode(',', $request->status);
                $query->whereIn('status', $statuses);
            } else {
                $query->where('status', 'scheduled');
            }

            // On ne montre que les trajets futurs pour éviter les résultats périmés
            $query->where('departure_time', '>', now())
                ->with(['route.departurePort', 'route.arrivalPort', 'ship']);

            // Filtres optionnels
            if ($request->has('route_id')) {
                $query->where('route_id', $request->route_id);
            }

            if ($request->has('date')) {
                $query->whereDate('departure_time', $request->date);
            }

            if ($request->has('min_capacity')) {
                $query->where('available_seats_pax', '>=', $request->min_capacity);
            }

            $trips = $query->orderBy('departure_time')->get();

            return $trips->map(function ($trip) {
                return $this->formatTripResponse($trip);
            });
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Voyages récupérés avec succès',
            'data' => [
                'trips' => $result,
                'total' => $result->count()
            ]
        ]);
    }

    /**
     * Détails d'une traversée
     */
    public function show(Trip $trip): JsonResponse
    {
        $cacheKey = "trip_details_{$trip->id}";
        
        $tripData = \Illuminate\Support\Facades\Cache::remember($cacheKey, 600, function () use ($trip) {
            // Charger les relations UNIQUEMENT si le cache expire
            $trip->load([
                'route.departurePort', 
                'route.arrivalPort', 
                'ship'
            ]);
            return $this->formatTripResponse($trip, true);
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Détails du voyage récupérés',
            'data' => $tripData
        ]);
    }

    /**
     * Calculer les prix pour un voyage
     */
    public function pricing(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'route_id' => 'required|exists:routes,id',
            'passengers' => 'required|array|min:1',
            'passengers.*.type' => 'required|in:adult,child,baby',
            'passengers.*.nationality_group' => 'required|in:national,resident,non-resident',
        ]);

        $totalPrice = 0;
        $details = [];

        foreach ($validated['passengers'] as $passenger) {
            $priceData = $this->pricingService->calculatePrice(
                $validated['route_id'],
                $passenger['type'],
                $passenger['nationality_group']
            );

            if (!$priceData['found']) {
                return response()->json([
                    'status' => 'error',
                    'message' => $priceData['error'],
                    'data' => null
                ], 400);
            }

            $totalPrice += $priceData['total'];
            $details[] = [
                'type' => $passenger['type'],
                'nationality_group' => $passenger['nationality_group'],
                'base_price' => $priceData['base'],
                'tax' => $priceData['tax'],
                'total' => $priceData['total'],
            ];
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Tarification calculée',
            'data' => [
                'route_id' => $validated['route_id'],
                'passengers' => count($validated['passengers']),
                'details' => $details,
                'total_price' => $totalPrice,
                'currency' => 'FCFA'
            ]
        ]);
    }

    /**
     * Formater la réponse d'un trip
     */
    private function formatTripResponse(Trip $trip, bool $detailed = false): array
    {
        $data = [
            'id' => $trip->id,
            'departure_time' => $trip->departure_time->toIso8601String(),
            'arrival_time' => $trip->arrival_time ? $trip->arrival_time->toIso8601String() : null,
            'status' => $trip->status,
            'route' => [
                'id' => $trip->route->id,
                'name' => $trip->route->name,
                'duration_minutes' => $trip->route->duration_minutes,
                'departure_port' => [
                    'name' => $trip->route->departurePort->name,
                    'code' => $trip->route->departurePort->code,
                    'city' => $trip->route->departurePort->city,
                ],
                'arrival_port' => [
                    'name' => $trip->route->arrivalPort->name,
                    'code' => $trip->route->arrivalPort->code,
                    'city' => $trip->route->arrivalPort->city,
                ],
            ],
            'ship' => [
                'id' => $trip->ship->id,
                'name' => $trip->ship->name,
                'capacity_pax' => $trip->ship->capacity_pax,
                'type' => $trip->ship->type,
            ],
            'available_seats_pax' => $trip->available_seats_pax,
            'capacity_remaining' => $trip->available_seats_pax,
            'availability' => $trip->available_seats_pax > 0 ? 'available' : 'full',
            'base_price' => $this->getTripBasePrice($trip),
            'pricing_settings' => $trip->pricing_settings,
        ];

        if ($detailed) {
            $data['created_at'] = $trip->created_at->toIso8601String();
            $data['updated_at'] = $trip->updated_at->toIso8601String();
        }

        return $data;
    }

    /**
     * Extraire le prix de base d'un voyage
     */
    private function getTripBasePrice(Trip $trip): string
    {
        if (isset($trip->pricing_settings['categories'])) {
            foreach ($trip->pricing_settings['categories'] as $category) {
                if ($category['type'] === 'ADULT') {
                    return (string) $category['price'];
                }
            }
        }

        // Fallback simple si pas de réglages spécifiques
        return "1500";
    }
}
