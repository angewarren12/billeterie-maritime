<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Trip;
use App\Models\Route;
use App\Models\Port;
use App\Models\Ship;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

class BookingTest extends TestCase
{
    use DatabaseMigrations, WithFaker;

    protected $trip;
    protected $route;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Setup Roles
        \Spatie\Permission\Models\Role::create(['name' => 'client', 'guard_name' => 'web']);
        \Spatie\Permission\Models\Role::create(['name' => 'client', 'guard_name' => 'sanctum']); // Create both to be safe

        // Setup Route & Trip
        $departure = Port::factory()->create(['name' => 'Dakar']);
        $arrival = Port::factory()->create(['name' => 'Gorée']);
        
        $this->route = Route::factory()->create([
            'departure_port_id' => $departure->id,
            'arrival_port_id' => $arrival->id,
        ]);

        $ship = Ship::factory()->create(['capacity_pax' => 50]);

        $this->trip = Trip::factory()->create([
            'route_id' => $this->route->id,
            'ship_id' => $ship->id,
            'available_seats_pax' => 50,
            'departure_time' => now()->addDays(1),
            'pricing_settings' => [
                'categories' => [
                    ['name' => 'Adulte National', 'type' => 'ADULT', 'price' => 1500],
                    ['name' => 'Enfant National', 'type' => 'CHILD', 'price' => 500],
                ]
            ]
        ]);
        
        // Mock Pricing Rule logic fallback if needed, or rely on service. 
        // For simplicity, we assume PricingService uses the settings above or defaults.
    }

    public function test_guest_can_create_booking_and_account()
    {
        $payload = [
            'trip_id' => $this->trip->id,
            'payment_method' => 'cash',
            'create_account' => true,
            'email' => 'guest@example.com',
            'password' => 'password123',
            'phone' => '770000000',
            'passenger_name_for_account' => 'Guest User',
            'passengers' => [
                [
                    'name' => 'Guest User',
                    'type' => 'adult',
                    'nationality_group' => 'national'
                ]
            ]
        ];

        $response = $this->postJson('/api/bookings', $payload);

        $response->assertStatus(201)
            ->assertJsonFragment(['email' => 'guest@example.com']);

        $this->assertDatabaseHas('users', ['email' => 'guest@example.com']);
        $this->assertDatabaseHas('bookings', ['trip_id' => $this->trip->id]);
        $this->assertEquals(49, $this->trip->fresh()->available_seats_pax);
    }

    public function test_authenticated_user_can_create_booking()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $payload = [
            'trip_id' => $this->trip->id,
            'payment_method' => 'wave',
            'passengers' => [
                [
                    'name' => 'My Friend',
                    'type' => 'adult',
                    'nationality_group' => 'national'
                ],
                [
                    'name' => 'My Child',
                    'type' => 'child',
                    'nationality_group' => 'national'
                ]
            ]
        ];

        $response = $this->postJson('/api/bookings', $payload);

        $response->assertStatus(201);
        $this->assertEquals(48, $this->trip->fresh()->available_seats_pax);
        // Price check: 1500 + 500 = 2000
        $this->assertEquals(2000, $response->json('payment.amount'));
    }

    public function test_booking_fails_if_capacity_exceeded()
    {
        // Reduce capacity
        $this->trip->update(['available_seats_pax' => 1]);

        $payload = [
            'trip_id' => $this->trip->id,
            'payment_method' => 'cash',
            'passengers' => [
                ['name' => 'P1', 'type' => 'adult', 'nationality_group' => 'national'],
                ['name' => 'P2', 'type' => 'adult', 'nationality_group' => 'national']
            ]
        ];

        $response = $this->postJson('/api/bookings', $payload);

        $response->assertStatus(400)
            ->assertJsonFragment(['message' => "Places insuffisantes pour l'aller"]);
    }
}
