<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Route;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RouteController extends Controller
{
    /**
     * Liste de tous les trajets maritimes disponibles
     */
    public function index(Request $request): JsonResponse
    {
        $routes = Route::where('is_active', true)
            ->with(['departurePort:id,name,code,city', 'arrivalPort:id,name,code,city'])
            ->get()
            ->map(function ($route) {
                return [
                    'id' => $route->id,
                    'name' => $route->name,
                    'departure_port' => $route->departurePort ? [
                        'id' => $route->departurePort->id,
                        'name' => $route->departurePort->name,
                        'code' => $route->departurePort->code,
                        'city' => $route->departurePort->city,
                    ] : null,
                    'arrival_port' => $route->arrivalPort ? [
                        'id' => $route->arrivalPort->id,
                        'name' => $route->arrivalPort->name,
                        'code' => $route->arrivalPort->code,
                        'city' => $route->arrivalPort->city,
                    ] : null,
                    'duration_minutes' => $route->duration_minutes,
                    'distance_km' => $route->distance_km,
                ];
            });

        return response()->json([
            'routes' => $routes
        ]);
    }

    /**
     * Détails d'un trajet spécifique
     */
    public function show(Route $route): JsonResponse
    {
        $route->load(['departurePort', 'arrivalPort']);

        return response()->json([
            'route' => [
                'id' => $route->id,
                'name' => $route->name,
                'departure_port' => [
                    'id' => $route->departurePort->id,
                    'name' => $route->departurePort->name,
                    'code' => $route->departurePort->code,
                    'city' => $route->departurePort->city,
                ],
                'arrival_port' => [
                    'id' => $route->arrivalPort->id,
                    'name' => $route->arrivalPort->name,
                    'code' => $route->arrivalPort->code,
                    'city' => $route->arrivalPort->city,
                ],
                'duration_minutes' => $route->duration_minutes,
                'distance_km' => $route->distance_km,
                'is_active' => $route->is_active,
            ]
        ]);
    }
}
