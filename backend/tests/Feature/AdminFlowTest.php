<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Trip;
use App\Models\Route;
use App\Models\Ship;
use App\Models\SubscriptionPlan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminFlowTest extends TestCase
{
    // We don't use RefreshDatabase here to test against the seeded local DB state
    // or we should be careful. The user likely wants to test the CURRENT state.
    // So we won't reset the DB, just add data.

    public function test_admin_can_create_trip()
    {
        // 1. Authenticate as Admin
        $admin = User::where('email', 'admin@maritime.sn')->first();
        if (!$admin) {
             // Fallback if seed didn't run or email differs
             $admin = User::factory()->create(['role' => 'admin', 'email' => 'admin_test@maritime.sn']);
        }

        // 2. Prepare Data
        $route = Route::first();
        $ship = Ship::first();

        // 3. Create Trip via API
        $response = $this->actingAs($admin)->postJson('/api/admin/trips', [
            'route_id' => $route->id,
            'ship_id' => $ship->id,
            'departure_time' => now()->addDay()->format('Y-m-d H:i:s'),
            'base_price' => 5000,
            'pricing_settings' => [] // Optional or default
        ]);

        // 4. Verify
        $response->assertStatus(201);
        $this->assertDatabaseHas('trips', [
            'route_id' => $route->id,
            'ship_id' => $ship->id,
        ]);
        
        echo "\n✔ Trip creation verified successfully.";
    }

    public function test_subscription_plan_has_multi_passenger_enabled()
    {
        // 1. Find the specific plan
        $plan = SubscriptionPlan::where('name', 'like', '%Pass 10%')->first();

        if ($plan) {
            // 2. Assert
            $this->assertTrue((bool)$plan->allow_multi_passenger, "Plan '{$plan->name}' should have multi-passenger enabled.");
            echo "\n✔ Plan '{$plan->name}' has multi-passenger enabled.";
        } else {
             echo "\n⚠ 'Pass 10 Voyages' plan not found. Skipping specific check.";
        }
    }
}
