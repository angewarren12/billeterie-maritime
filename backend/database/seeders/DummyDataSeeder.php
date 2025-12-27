<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Badge;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\Trip;
use App\Models\Route;
use App\Models\Ship;
use App\Models\Booking;
use App\Models\Ticket;
use App\Models\Transaction;
use Illuminate\Support\Str;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        // 0. Ensure we have data foundation from MaritimeSeeder
        // (Assuming MaritimeSeeder has run or will be run before this)
        $routes = Route::all();
        $ships = Ship::all();
        $plans = SubscriptionPlan::all();

        if ($routes->isEmpty() || $ships->isEmpty()) {
            $this->command->warn('No Routes or Ships found. Skipping DummyDataSeeder detail generation.');
            return;
        }

        // 1. Create Clients
        $this->command->info('Creating Clients...');
        $clients = User::factory(20)->create([
            'role' => 'client',
            'password' => bcrypt('password'), // Easy password for testing
            'nationality' => 'sénégalaise',
        ]);

        // 2. Create Badges
        $this->command->info('Creating Badges...');
        foreach ($clients as $index => $client) {
            // 70% chance to have a badge
            if (rand(0, 100) < 70) {
                Badge::create([
                    'code' => 'RFID-' . strtoupper(Str::random(8)),
                    'user_id' => $client->id,
                    'status' => 'active',
                    'issued_at' => now()->subDays(rand(1, 365)),
                ]);
            }
        }
        // Create some unassigned badges
        for ($i = 0; $i < 10; $i++) {
            Badge::create([
                'code' => 'STOCK-' . strtoupper(Str::random(8)),
                'user_id' => null,
                'status' => 'active',
                'issued_at' => null,
            ]);
        }

        // 3. Create Subscriptions
        $this->command->info('Creating Subscriptions...');
        foreach ($clients as $client) {
            // Only clients with badges get subscriptions in this scenario? 
            // Or maybe subscriptions generate a badge?
            // Let's just give some random subscriptions.
            if (rand(0, 100) < 40 && $plans->isNotEmpty()) {
                $plan = $plans->random();
                $startDate = now()->subDays(rand(0, 60));
                Subscription::create([
                    'user_id' => $client->id,
                    'plan_id' => $plan->id,
                    // Use the client's badge if they have one, or generate a legacy ID
                    'rfid_card_id' => $client->activeBadge ? $client->activeBadge->code : 'LEGACY-' . Str::random(6),
                    'start_date' => $startDate,
                    'end_date' => $startDate->copy()->addDays($plan->duration_days),
                    'status' => 'active',
                    'current_credit' => 0,
                ]);
            }
        }

        // 4. Create Trips (Schedule)
        $this->command->info('Generating Schedule & Trips...');
        $trips = collect();
        $currentDate = now()->subDays(30);
        $endDate = now()->addDays(30);

        while ($currentDate <= $endDate) {
            foreach ($routes as $route) {
                // 3 trips per day per route
                for ($h = 8; $h <= 18; $h += 4) {
                    $ship = $ships->random();
                    $departureTime = $currentDate->copy()->setTime($h, 0);
                    $trips->push(Trip::create([
                        'route_id' => $route->id,
                        'ship_id' => $ship->id,
                        'departure_time' => $departureTime,
                        'arrival_time' => $departureTime->copy()->addMinutes($route->duration_minutes),
                        'status' => $departureTime < now() ? 'completed' : 'scheduled',
                        'available_seats_pax' => $ship->capacity_pax,
                    ]));
                }
            }
            $currentDate->addDay();
        }

        // 5. Create Bookings & Tickets
        $this->command->info('Simulating Bookings...');
        foreach ($clients as $client) {
            // Each client makes 0-5 bookings
            $numBookings = rand(0, 5);
            for ($i = 0; $i < $numBookings; $i++) {
                $trip = $trips->random();
                // Avoid booking adjacent trips if unrealistic, but keep simple for now
                
                $amount = rand(1500, 5000);
                
                $booking = Booking::create([
                    'user_id' => $client->id,
                    'total_amount' => $amount,
                    'status' => 'confirmed',
                    'booking_reference' => 'BK-' . strtoupper(Str::random(6)),
                ]);

                // Transaction
                Transaction::create([
                    'booking_id' => $booking->id,
                    'amount' => $amount,
                    'payment_method' => 'cash',
                    'status' => 'completed',
                    'external_reference' => 'TX-' . Str::random(10),
                ]);

                // Ticket (1 passenger)
                Ticket::create([
                    'booking_id' => $booking->id,
                    'trip_id' => $trip->id,
                    'qr_code_data' => 'QR-' . Str::random(12),
                    'passenger_name' => $client->name,
                    'passenger_type' => 'adult',
                    'nationality_group' => 'national', // Default for now
                    'price_paid' => $amount,
                    'status' => $trip->status === 'completed' ? 'used' : 'issued',
                ]);
            }
        }
    }
}
