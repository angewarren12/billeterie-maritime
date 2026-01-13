<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class RouteController extends Controller
{
    private $cacheKey = 'admin_routes_all';

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $start = microtime(true);

        $routes = Cache::remember($this->cacheKey, 3600, function () {
            return Route::with(['departurePort', 'arrivalPort'])->get();
        });

        return response()->json([
            'data' => $routes,
            'internal_time_ms' => round((microtime(true) - $start) * 1000)
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'departure_port_id' => 'required|exists:ports,id',
            'arrival_port_id' => 'required|exists:ports,id',
            'duration_minutes' => 'required|integer|min:1',
            'is_active' => 'boolean',
            'create_return' => 'boolean',
        ]);

        $route = Route::create([
            'departure_port_id' => $validated['departure_port_id'],
            'arrival_port_id' => $validated['arrival_port_id'],
            'duration_minutes' => $validated['duration_minutes'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if ($request->boolean('create_return')) {
            Route::create([
                'departure_port_id' => $validated['arrival_port_id'],
                'arrival_port_id' => $validated['departure_port_id'],
                'duration_minutes' => $validated['duration_minutes'],
                'is_active' => $validated['is_active'] ?? true,
            ]);
        }

        Cache::forget($this->cacheKey);

        return response()->json([
            'message' => 'Trajet(s) créés avec succès',
            'data' => $route->load(['departurePort', 'arrivalPort'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Route $route)
    {
        return response()->json([
            'data' => $route->load(['departurePort', 'arrivalPort'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Route $route)
    {
        $validated = $request->validate([
            'departure_port_id' => 'sometimes|exists:ports,id',
            'arrival_port_id' => 'sometimes|exists:ports,id',
            'duration_minutes' => 'sometimes|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $route->update($validated);
        Cache::forget($this->cacheKey);

        return response()->json([
            'message' => 'Trajet mis à jour avec succès',
            'data' => $route->load(['departurePort', 'arrivalPort'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Route $route)
    {
        // Vérifier s'il y a des voyages associés
        if ($route->trips()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer ce trajet car il est utilisé par des voyages.'
            ], 422);
        }

        $route->delete();
        Cache::forget($this->cacheKey);

        return response()->json([
            'message' => 'Trajet supprimé avec succès'
        ]);
    }
}
