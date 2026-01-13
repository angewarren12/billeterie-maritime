<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class TripController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
                \Illuminate\Support\Facades\Gate::authorize('view_any_trip');
                $start = microtime(true);

                // Optimization: only run auto-update every 60 seconds to avoid DB load on every hit
                \Illuminate\Support\Facades\Cache::remember('trips_status_auto_update', 60, function () {
                    Trip::where('status', 'scheduled')
                        ->where('departure_time', '<=', now())
                        ->update(['status' => 'departed']);
                    return true;
                });
                
                $query = Trip::with(['ship', 'route.departurePort', 'route.arrivalPort'])
                    ->orderByRaw("CASE 
                        WHEN DATE(departure_time) = CURRENT_DATE THEN 0 
                        WHEN departure_time > NOW() THEN 1 
                        ELSE 2 
                    END")
                    ->orderBy('departure_time', 'asc');

                if ($request->filled('route_id') && $request->route_id !== 'all') {
                    $query->where('route_id', $request->route_id);
                }

                if ($request->filled('departure_port_id')) {
                    $query->whereHas('route', function($q) use ($request) {
                        $q->where('departure_port_id', $request->departure_port_id);
                    });
                }

                if ($request->filled('status') && $request->status !== 'all') {
                    if (str_contains($request->status, ',')) {
                        $query->whereIn('status', explode(',', $request->status));
                    } else {
                        $query->where('status', $request->status);
                    }
                }

                if ($request->filled('search')) {
                    $search = $request->search;
                    $query->where(function($q) use ($search) {
                        $q->whereHas('route', function($rq) use ($search) {
                            $rq->whereHas('departurePort', function($pq) use ($search) {
                                $pq->where('name', 'like', "%{$search}%");
                            })->orWhereHas('arrivalPort', function($pq) use ($search) {
                                $pq->where('name', 'like', "%{$search}%");
                            });
                        })->orWhereHas('ship', function($sq) use ($search) {
                            $sq->where('name', 'like', "%{$search}%");
                        });
                    });
                }

                // Use pagination for performance
                $trips = $query->paginate($request->input('per_page', 15));

                return response()->json([
                    'data' => $trips->items(),
                    'meta' => [
                        'current_page' => $trips->currentPage(),
                        'last_page' => $trips->lastPage(),
                        'total' => $trips->total(),
                        'per_page' => $trips->perPage(),
                    ],
                    'internal_time_ms' => round((microtime(true) - $start) * 1000)
                ]);
            }

            public function batchStore(Request $request)
            {
                \Illuminate\Support\Facades\Gate::authorize('manage_trips');
                $validated = $request->validate([
                    'trips' => 'required|array',
                    'trips.*.ship_id' => 'required|exists:ships,id',
                    'trips.*.route_id' => 'required|exists:routes,id',
                    'trips.*.departure_time' => 'required|date',
                    'trips.*.arrival_time' => 'nullable|date|after:trips.*.departure_time',
                    'trips.*.description' => 'nullable|string',
                    'trips.*.pricing_settings' => 'nullable|array',
                    'trips.*.status' => 'required|in:scheduled,boarding,departed,arrived,cancelled',
                    'common_images' => 'nullable|array',
                    'common_images.*' => 'image|max:2048',
                ]);

                $imagePaths = [];
                if ($request->hasFile('common_images')) {
                    foreach ($request->file('common_images') as $image) {
                        $imagePaths[] = $image->store('trips', 'public');
                    }
                }

                $createdTrips = [];
                DB::transaction(function () use ($validated, $imagePaths, &$createdTrips) {
                    foreach ($validated['trips'] as $tripData) {
                        if (!isset($tripData['available_seats_pax'])) {
                            $ship = \App\Models\Ship::find($tripData['ship_id']);
                            $tripData['available_seats_pax'] = $ship->capacity_pax ?? 0;
                        }
                        $tripData['images'] = $imagePaths;
                        $createdTrips[] = Trip::create($tripData);
                    }
                });

                return response()->json([
                    'message' => count($createdTrips) . ' voyages créés avec succès',
                    'count' => count($createdTrips)
                ], 201);
            }

            /**
            * Store a newly created resource in storage.
            */
            public function store(Request $request)
            {
                \Illuminate\Support\Facades\Gate::authorize('manage_trips');
                $validated = $request->validate([
                    'ship_id' => 'required|exists:ships,id',
                    'route_id' => 'required|exists:routes,id',
                    'departure_time' => 'required|date',
                    'arrival_time' => 'nullable|date|after:departure_time',
                    'price_adult' => 'nullable|numeric|min:0',
                    'price_child' => 'nullable|numeric|min:0',
                    'status' => 'required|in:scheduled,boarding,departed,arrived,cancelled',
                    'capacity' => 'nullable|integer|min:0',
                    'images' => 'nullable|array',
                    'images.*' => 'image|max:2048', // Max 2MB per image
                    'description' => 'nullable|string',
                    'pricing_settings' => 'nullable|array',
                    'pricing_settings.categories' => 'nullable|array',
                    'pricing_settings.categories.*.name' => 'required_with:pricing_settings.categories|string',
                    'pricing_settings.categories.*.price' => 'required_with:pricing_settings.categories|numeric|min:0',
                    'pricing_settings.categories.*.type' => 'required_with:pricing_settings.categories|in:ADULT,CHILD',
                ]);

                // Auto-populate capacity fields from ship if not provided
                if (!isset($validated['available_seats_pax'])) {
                    $ship = \App\Models\Ship::find($validated['ship_id']);
                    if ($ship) {
                        $validated['available_seats_pax'] = $validated['available_seats_pax'] ?? $ship->capacity_pax;
                    }
                }

                if ($request->hasFile('images')) {
                    $imagePaths = [];
                    foreach ($request->file('images') as $image) {
                        // Store in 'public/trips' folder
                        $path = $image->store('trips', 'public');
                        $imagePaths[] = $path;
                    }
                    $validated['images'] = $imagePaths;
                }

                $trip = Trip::create($validated);

                return response()->json([
                    'message' => 'Voyage créé avec succès',
                    'trip' => $trip->load(['ship', 'route.departurePort', 'route.arrivalPort']),
                ], 201);
            }

            /**
            * Display the specified resource.
            */
            public function show(string $id)
            {
                $start = microtime(true);
                $trip = Trip::with(['ship', 'route.departurePort', 'route.arrivalPort'])->findOrFail($id);
                
                return response()->json([
                    'data' => $trip,
                    'internal_time_ms' => round((microtime(true) - $start) * 1000)
                ]);
            }

            /**
            * Update the specified resource in storage.
            */
            public function update(Request $request, string $id)
            {
                \Illuminate\Support\Facades\Gate::authorize('manage_trips');
                $trip = Trip::findOrFail($id);

                $validated = $request->validate([
                    'ship_id' => 'sometimes|exists:ships,id',
                    'route_id' => 'sometimes|exists:routes,id',
                    'departure_time' => 'sometimes|date',
                    'arrival_time' => 'sometimes|date|after:departure_time',
                    'price_adult' => 'sometimes|numeric|min:0',
                    'price_child' => 'sometimes|numeric|min:0',
                    'status' => 'sometimes|in:scheduled,boarding,departed,arrived,cancelled',
                    'capacity' => 'nullable|integer|min:0',
                    'images' => 'nullable|array',
                    'images.*' => 'image|max:2048',
                    'description' => 'nullable|string',
                ]);

                if ($request->hasFile('images')) {
                    $imagePaths = $trip->images ?? [];
                    foreach ($request->file('images') as $image) {
                        $path = $image->store('trips', 'public');
                        $imagePaths[] = $path;
                    }
                    $validated['images'] = $imagePaths;
                }

                $trip->update($validated);

                return response()->json([
                    'message' => 'Voyage mis à jour avec succès',
                    'trip' => $trip->load(['ship', 'route.departurePort', 'route.arrivalPort']),
                ]);
            }

            /**
            * Remove the specified resource from storage.
            */
            public function destroy(string $id)
            {
                \Illuminate\Support\Facades\Gate::authorize('manage_trips');
                $trip = Trip::findOrFail($id);
                
                // Vérifier s'il y a des réservations avant de supprimer
                if ($trip->bookings()->exists()) {
                    return response()->json([
                        'message' => 'Impossible de supprimer ce voyage car il a des réservations associées.',
                    ], 422);
                }

                $trip->delete();

                return response()->json([
                    'message' => 'Voyage supprimé avec succès',
                ]);
            }
        }
