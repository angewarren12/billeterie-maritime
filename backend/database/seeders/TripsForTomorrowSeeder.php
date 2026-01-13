<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Trip;
use App\Models\Route;
use App\Models\Ship;
use Carbon\Carbon;

class TripsForTomorrowSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $routes = Route::all();
        $ships = Ship::all();

        if ($routes->isEmpty() || $ships->isEmpty()) {
            echo "Erreur: Pas de routes ou de navires trouvés dans la base de données.\n";
            return;
        }

        $times = [
            '08:30', '10:45', '13:00', '15:15', '17:30', '19:45'
        ];

        foreach ($times as $index => $time) {
            $route = $routes[$index % $routes->count()];
            $ship = $ships[$index % $ships->count()];
            
            $departureTime = Carbon::tomorrow()->setTimeFromTimeString($time);
            $arrivalTime = (clone $departureTime)->addMinutes($route->duration_minutes ?? 20);

            Trip::create([
                'route_id' => $route->id,
                'ship_id' => $ship->id,
                'departure_time' => $departureTime,
                'arrival_time' => $arrivalTime,
                'status' => 'scheduled',
                'available_seats_pax' => $ship->capacity_pax ?? 200,
                'description' => 'Voyage généré automatiquement pour demain.',
            ]);
            
            echo "Voyage créé: " . $route->name . " à " . $time . " avec " . $ship->name . "\n";
        }
    }
}
