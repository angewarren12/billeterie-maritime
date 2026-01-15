<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Port;
use App\Http\Resources\PortResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PortController extends Controller
{
    private $cacheKey = 'ports_all';

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $start = microtime(true);
        
        $ports = PortResource::collection(Port::all())->resolve();

        return response()->json([
            'data' => $ports,
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
            'code' => 'required|string|max:10|unique:ports',
            'city' => 'required|string|max:255',
            'country' => 'required|string|max:255',
        ]);

        $port = Port::create($validated);
        Cache::forget($this->cacheKey);

        return (new PortResource($port))->response()->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Port $port)
    {
        return new PortResource($port);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Port $port)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:10|unique:ports,code,' . $port->id,
            'city' => 'sometimes|required|string|max:255',
            'country' => 'sometimes|required|string|max:255',
        ]);

        $port->update($validated);
        Cache::forget($this->cacheKey);

        return new PortResource($port);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Port $port)
    {
        if ($port->departureRoutes()->exists() || $port->arrivalRoutes()->exists()) {
            return response()->json(['message' => 'Impossible de supprimer ce port car il est lié à des trajets.'], 409);
        }

        $port->delete();
        Cache::forget($this->cacheKey);

        return response()->json(['message' => 'Port supprimé avec succès']);
    }
}
