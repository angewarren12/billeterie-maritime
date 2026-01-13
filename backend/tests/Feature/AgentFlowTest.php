<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Trip;
use App\Models\Ticket;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgentFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_agent_can_validate_ticket()
    {
        try {
            // 1. Setup Data
            $route = \App\Models\Route::firstOrCreate(['duration_minutes' => 30]);
            $ship = \App\Models\Ship::firstOrCreate(['name' => 'Test Ship', 'capacity_pax' => 100]);
            
            $trip = Trip::create([
                'route_id' => $route->id,
                'ship_id' => $ship->id,
                'departure_time' => now()->addHour(),
                'status' => 'scheduled',
                'available_seats_pax' => 50,
                'base_price' => 5000 
            ]);

            $user = User::factory()->create();

            $booking = \App\Models\Booking::create([
                'trip_id' => $trip->id,
                'user_id' => $user->id, 
                'booking_reference' => 'REF123',
                'total_amount' => 1500,
                'status' => 'confirmed'
            ]);

            $ticket = Ticket::create([
                'booking_id' => $booking->id,
                'trip_id' => $trip->id,
                'qr_code_data' => 'placeholder',
                'status' => 'issued',
                'price_paid' => 1500,
                'passenger_name' => 'Agent Test Pax',
                'passenger_type' => 'adult',
                'nationality_group' => 'national'
            ]);
        } catch (\Exception $e) {
            dd('Setup failed: ' . $e->getMessage());
        }

        // Generate Valid V1 QR
        // Format: V1|TICKET_ID|BOOKING_REF|TRIP_ID|HASH
        $signature = hash_hmac('sha256', $ticket->id . 'REF123', config('app.key'));
        $shortHash = substr($signature, 0, 8);
        $qrData = "V1|{$ticket->id}|REF123|{$trip->id}|{$shortHash}";

        $ticket->update(['qr_code_data' => $qrData]);

        // 2. Perform Scan
        $agent = User::factory()->create(['role' => 'agent', 'email' => 'agent@test.com']);
        $port = \App\Models\Port::firstOrCreate(['name' => 'Test Port', 'code' => 'TPT', 'city' => 'Test City', 'country' => 'Test Country']);
        $device = \App\Models\AccessDevice::create([
            'port_id' => $port->id, 
            'name' => 'Agent PDA', 
            'api_token' => 'AGENT-PDA-01', 
            'type' => 'pda',
            'device_identifier' => 'PDA-01'
        ]);

        $response = $this->actingAs($agent)->postJson('/api/scan/validate', [
            'qr_data' => $qrData,
            'device_id' => $device->id
        ]);

        // 3. Verify
        $response->assertStatus(200);
        $response->assertJson(['status' => 'success']);
        
        $ticket->refresh();
        $this->assertEquals('boarded', $ticket->status);
        $this->assertNotNull($ticket->used_at);

        echo "\n✔ Agent Ticket Validation verified.";
    }

    public function test_device_can_validate_rfid_badge()
    {
        // 1. Create access device
        $port = \App\Models\Port::firstOrCreate(['name' => 'Test Port', 'code' => 'TPT', 'city' => 'Test City', 'country' => 'Test Country']);

        $device = \App\Models\AccessDevice::create([
            'port_id' => $port->id,
            'name' => 'Turnstile Test',
            'location' => 'Gate 1',
            'device_identifier' => 'DEV-001',
            'api_token' => 'DEVICE-TOKEN-123',
            'type' => 'tripod'
        ]);

        // 2. Create Badge/Subscription
        $user = User::factory()->create();
        $plan = SubscriptionPlan::firstOrCreate(['name' => 'Unlimited Plan Test'], ['price' => 50000, 'duration_days' => 30, 'credit_type' => 'unlimited']);
        
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'rfid_card_id' => 'RFID-TAG-XYZ',
            'status' => 'active',
            'start_date' => now(),
            'end_date' => now()->addMonth(),
            'voyage_credits_initial' => 0,
            'voyage_credits_remaining' => 0
        ]);

        // 3. Simulate Device Scan
        $response = $this->postJson('/api/device/scan', [
            'uid' => 'RFID-TAG-XYZ',
            'direction' => 'in'
        ], [
            'X-Device-Token' => 'DEVICE-TOKEN-123'
        ]);

        // 4. Verify
        $response->assertStatus(200);
        $response->assertJson([
            'open' => true,
            'status' => 'success'
        ]);

        // Check Access Log
        $this->assertDatabaseHas('access_logs', [
            'subscription_id' => $subscription->id,
            'device_id' => $device->id,
            'result' => 'granted'
        ]);

        echo "\n✔ Fixed Device RFID Validation verified.";
    }
}
