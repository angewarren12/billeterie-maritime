<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Trip;
use Carbon\Carbon;

class TodayTripsSeeder extends Seeder
{
    public function run(): void
    {
        $times = ['17:00', '18:00', '19:30', '20:30', '21:30'];
        $shipIds = [4, 5]; // Assumed ship IDs

        foreach ($times as $index => $time) {
            Trip::create([
                'route_id' => 4, // Dakar -> Goree
                'ship_id' => $shipIds[$index % 2],
                'departure_time' => Carbon::now()->setTimeFromTimeString($time),
                'arrival_time' => Carbon::now()->setTimeFromTimeString($time)->addMinutes(20),
                'status' => 'scheduled',
                'available_seats_pax' => 150,
                // 'base_price' is NOT a column in trips table. It's in pricing_rules.
            ]);
        }
    }
}
