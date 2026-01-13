<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;

class ShipController extends Controller
{
    private $cacheKey = 'admin_ships_all';

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $start = microtime(true);

        $ships = Cache::remember($this->cacheKey, 3600, function () {
            return Ship::orderBy('name')->get();
        });

        return response()->json([
            'data' => $ships,
            'internal_time_ms' => round((microtime(true) - $start) * 1000)
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'capacity_pax' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'image|max:2048', // Max 2MB per image
        ]);

        if ($request->hasFile('images')) {
            $imagePaths = [];
            foreach ($request->file('images') as $image) {
                $path = $image->store('ships', 'public');
                $imagePaths[] = $path;
            }
            $validated['images'] = $imagePaths;
        }

        $ship = Ship::create($validated);
        Cache::forget($this->cacheKey);

        return response()->json([
            'message' => 'Navire créé avec succès',
            'data' => $ship
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $ship = Ship::findOrFail($id);
        return response()->json(['data' => $ship]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $ship = Ship::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'company' => 'sometimes|string|max:255',
            'type' => 'sometimes|string|max:255',
            'capacity_pax' => 'sometimes|integer|min:0',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'image|max:2048',
        ]);

        if ($request->hasFile('images')) {
            $imagePaths = $ship->images ?? [];
            foreach ($request->file('images') as $image) {
                $path = $image->store('ships', 'public');
                $imagePaths[] = $path;
            }
            $validated['images'] = $imagePaths;
        }

        $ship->update($validated);
        Cache::forget($this->cacheKey);

        return response()->json([
            'message' => 'Navire mis à jour avec succès',
            'data' => $ship
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $ship = Ship::findOrFail($id);
        
        // Prevent deletion if linked to trips
        if ($ship->trips()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer ce navire car il est lié à des voyages existants.',
            ], 409);
        }

        $ship->delete();
        Cache::forget($this->cacheKey);

        return response()->json([
            'message' => 'Navire supprimé avec succès'
        ]);
    }
}
