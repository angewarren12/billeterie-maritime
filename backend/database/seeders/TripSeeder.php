<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Trip;
use App\Models\Route;
use App\Models\Ship;
use Carbon\Carbon;
use Illuminate\Support\Str;

class TripSeeder extends Seeder
{
    public function run(): void
    {
        $routeDkrGor = Route::whereHas('departurePort', function($q) { $q->where('code', 'DKR'); })
                           ->whereHas('arrivalPort', function($q) { $q->where('code', 'GOR'); })
                           ->first();
        
        $routeGorDkr = Route::whereHas('departurePort', function($q) { $q->where('code', 'GOR'); })
                           ->whereHas('arrivalPort', function($q) { $q->where('code', 'DKR'); })
                           ->first();

        $ship = Ship::where('name', 'Coumba Castel')->first() ?? Ship::first();

        if (!$routeDkrGor || !$routeGorDkr || !$ship) {
            return;
        }

        // Generate trips for 14 days
        $startDate = Carbon::today();
        $endDate = Carbon::today()->addDays(14);

        for ($date = $startDate; $date->lte($endDate); $date->addDay()) {
            $isSunday = $date->isSunday();
            $isFriday = $date->isFriday();
            $isSaturday = $date->isSaturday();

            if ($isSunday) {
                // Sunday Schedule
                $dakarTimes = ['07:00', '09:00', '10:00', '12:00', '14:00', '16:00', '17:00', '18:30', '19:30', '20:30', '23:30'];
                $goreeTimes = ['07:30', '09:30', '10:30', '12:30', '14:30', '16:30', '17:30', '19:00', '20:00', '21:00'];
                // For GOR-DKR on Sunday, 00:00 is technically Monday morning, handled by logic
            } else {
                // Mon-Sat Schedule
                $dakarTimes = ['06:15', '07:30', '10:00', '11:00', '12:30', '14:00', '16:00', '18:30', '20:00', '22:30'];
                $goreeTimes = ['06:45', '08:00', '10:30', '12:00', '14:00', '15:00', '16:30', '19:00', '20:30', '23:00'];

                if (!$isSaturday) {
                    $dakarTimes[] = '17:00';
                    $goreeTimes[] = '18:00';
                }

                if ($isFriday) {
                    $dakarTimes[] = '23:30';
                }

                if ($isSaturday) {
                    $dakarTimes[] = '00:45'; //technically early Sat, but image implies late Sat night
                    // Wait, 00:45 le Samedi usually means early Saturday. 
                    // Let's re-read the image: "23H30 le Vendredi", "00H45 le Samedi".
                    // "00H00 le Vendredi" (actually Saturday 00:00), "01H15 le Samedi" (actually Sunday 01:15).
                }
            }

            foreach ($dakarTimes as $time) {
                $dt = Carbon::parse($date->format('Y-m-d') . ' ' . $time);
                $this->createTrip($routeDkrGor->id, $ship, $dt);
            }

            foreach ($goreeTimes as $time) {
                $dt = Carbon::parse($date->format('Y-m-d') . ' ' . $time);
                $this->createTrip($routeGorDkr->id, $ship, $dt);
            }
            
            // Handle the midnight/late night specifics
            if ($isFriday) {
                // 00H00 Le Vendredi (technique Sat morning)
                $this->createTrip($routeGorDkr->id, $ship, Carbon::parse($date->format('Y-m-d') . ' 00:00')->addDay());
            }
            if ($isSaturday) {
                // 01H15 Le Samedi (technique Sun morning)
                $this->createTrip($routeGorDkr->id, $ship, Carbon::parse($date->format('Y-m-d') . ' 01:15')->addDay());
            }
            if ($isSunday) {
                 // 00H00 Dimanche (technique Mon morning)
                 $this->createTrip($routeGorDkr->id, $ship, Carbon::parse($date->format('Y-m-d') . ' 00:00')->addDay());
            }
        }
    }

    private function createTrip($routeId, $ship, $departureTime) {
        Trip::create([
            'id' => Str::uuid(),
            'route_id' => $routeId,
            'ship_id' => $ship->id,
            'departure_time' => $departureTime,
            'arrival_time' => (clone $departureTime)->addMinutes(20),
            'status' => 'scheduled',
            'available_seats_pax' => $ship->capacity_pax,
        ]);
    }
}
