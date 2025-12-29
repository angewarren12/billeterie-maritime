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
        $trips = Trip::with(['ship', 'route.departurePort', 'route.arrivalPort'])
            ->orderBy('departure_time', 'desc')
            ->paginate(15);

        return response()->json($trips);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ship_id' => 'required|exists:ships,id',
            'route_id' => 'required|exists:routes,id',
            'departure_time' => 'required|date',
            'arrival_time' => 'required|date|after:departure_time',
            'price_adult' => 'required|numeric|min:0',
            'price_child' => 'required|numeric|min:0',
            'status' => 'required|in:scheduled,boarding,departed,arrived,cancelled',
            'capacity' => 'nullable|integer|min:0', // Si on veut surcharger la capacité du bateau
        ]);

        $trip = Trip::create($validated);

        return response()->json([
            'message' => 'Voyage créé avec succès',
            'trip' => $trip->load(['ship', 'route']),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $trip = Trip::with(['ship', 'route.departurePort', 'route.arrivalPort'])->findOrFail($id);

        return response()->json($trip);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
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
        ]);

        $trip->update($validated);

        return response()->json([
            'message' => 'Voyage mis à jour avec succès',
            'trip' => $trip->load(['ship', 'route']),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
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
