<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Trip;
use App\Models\Route;
use App\Models\Ship;
use App\Models\SubscriptionPlan;
use App\Models\Subscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientFlowTest extends TestCase
{
    // Client Scenerio: "Le Voyage de Goran"

    public function test_client_can_book_trip_with_badge()
    {
        // 1. Create User
        $user = User::factory()->create([
            'email' => 'goran@user.com',
            'name' => 'Goran le Client'
        ]);

        // 2. Give User a Subscription (Badge)
        // We look for the "Pass 10 Voyages" plan or create it
        $plan = SubscriptionPlan::firstOrCreate(
            ['name' => 'Pass 10 Voyages'],
            [
                'price' => 12000,
                'duration_days' => 90,
                'period' => 'MENSUEL',
                'credit_type' => 'counted',
                'voyage_credits' => 10,
                'allow_multi_passenger' => true,
                'is_active' => true
            ]
        );

        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'start_date' => now(),
            'end_date' => now()->addDays(90),
            'status' => 'active',
            'voyage_credits_initial' => 10,
            'voyage_credits_remaining' => 10,
            'price_paid' => 12000
        ]);

        // 3. Ensure a Trip exists
        $route = Route::first();
        if (!$route) {
             $route = Route::factory()->create(); // Minimal fallback
        }
        
        $ship = Ship::first();
        if (!$ship) {
             $ship = Ship::factory()->create();
        }

        $trip = Trip::create([
            'route_id' => $route->id,
            'ship_id' => $ship->id,
            'departure_time' => now()->addDay()->setHour(10)->setMinute(0),
            'status' => 'scheduled',
            'available_seats_pax' => 100,
            'base_price' => 5000
        ]);

        // 4. Client Books for 2 passengers (Himself + 1)
        // Subscription allows multi-passenger, so cost should be covered.
        
        $response = $this->actingAs($user)->postJson('/api/bookings', [
            'trip_id' => $trip->id,
            'payment_method' => 'orange_money', // Should be ignored if covered by subscription? 
            // In BookingController, we usually send 'subscription_id' to trigger logic
            'subscription_id' => $subscription->id,
            'passengers' => [
                [
                    'name' => 'Goran',
                    'type' => 'adult',
                    'nationality_group' => 'national'
                ],
                [
                    'name' => 'Ami de Goran',
                    'type' => 'adult',
                    'nationality_group' => 'national'
                ]
            ]
        ]);

        // 5. Verification
        $response->assertStatus(201); // Created
        
        $bookingData = $response->json('booking');
        $this->assertEquals(0, $bookingData['total_amount'], 'Booking total amount should be 0 because badge covers it.');
        
        // Check Ticket count
        $this->assertCount(2, $bookingData['tickets'], 'Should have 2 tickets generated.');

        // Check Subscription Credits
        $subscription->refresh();
        $this->assertEquals(8, $subscription->voyage_credits_remaining, 'Subscription should have 8 credits left (10 - 2).');

        echo "\n✔ Client 'Le Voyage de Goran' scenario passed: 2 passengers booked for 0 FCFA, 2 credits deducted.";
    }
}
