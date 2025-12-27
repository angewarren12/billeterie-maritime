<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MaritimeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Ports
        $dakar = \App\Models\Port::create([
            'name' => 'Port de Dakar',
            'code' => 'DKR',
            'city' => 'Dakar',
            'country' => 'Sénégal',
        ]);

        $goree = \App\Models\Port::create([
            'name' => 'Port de Gorée',
            'code' => 'GOR',
            'city' => 'Gorée',
            'country' => 'Sénégal',
        ]);

        // 2. Ships
        $coumba = \App\Models\Ship::create([
            'name' => 'Coumba Castel',
            'company' => ' Liaison Maritime Dakar-Gorée',
            'type' => 'ferry',
            'capacity_pax' => 350,
            'capacity_vehicles' => 0,
            'is_active' => true,
        ]);

        $beer = \App\Models\Ship::create([
            'name' => 'Béer',
            'company' => ' Liaison Maritime Dakar-Gorée',
            'type' => 'ferry',
            'capacity_pax' => 150,
            'capacity_vehicles' => 0,
            'is_active' => true,
        ]);

        // 3. Routes
        $routeDkrGor = \App\Models\Route::create([
            'departure_port_id' => $dakar->id,
            'arrival_port_id' => $goree->id,
            'duration_minutes' => 20,
        ]);

        $routeGorDkr = \App\Models\Route::create([
            'departure_port_id' => $goree->id,
            'arrival_port_id' => $dakar->id,
            'duration_minutes' => 20,
        ]);

        // 4. Pricing Rules (Example for Dakar-Gorée)
        $nationalities = ['national', 'resident', 'african', 'hors_afrique'];
        $passengerTypes = ['adult', 'child'];

        $prices = [
            'adult' => [
                'national' => 1500,
                'resident' => 1500,
                'african' => 3500,
                'hors_afrique' => 6000,
            ],
            'child' => [
                'national' => 500,
                'resident' => 500,
                'african' => 2000,
                'hors_afrique' => 3000,
            ],
        ];

        foreach ($passengerTypes as $type) {
            foreach ($nationalities as $nat) {
                \App\Models\PricingRule::create([
                    'route_id' => $routeDkrGor->id,
                    'passenger_type' => $type,
                    'nationality_group' => $nat,
                    'base_price' => $prices[$type][$nat],
                    'tax_amount' => 0,
                ]);

                \App\Models\PricingRule::create([
                    'route_id' => $routeGorDkr->id,
                    'passenger_type' => $type,
                    'nationality_group' => $nat,
                    'base_price' => $prices[$type][$nat],
                    'tax_amount' => 0,
                ]);
            }
        }

        // 5. Subscription Plans
        \App\Models\SubscriptionPlan::create([
            'name' => 'Mensuel Classique',
            'price' => 30000,
            'duration_days' => 30,
        ]);

        \App\Models\SubscriptionPlan::create([
            'name' => 'Annuel Gold',
            'price' => 300000,
            'duration_days' => 365,
        ]);

        // 6. Access Devices
        \App\Models\AccessDevice::create([
            'name' => 'Tourniquet Entrée 1',
            'location' => 'Gare Maritime Dakar',
            'type' => 'tripod',
            'device_identifier' => 'TR-DKR-01',
        ]);

        \App\Models\AccessDevice::create([
            'name' => 'PDA Mobile 1',
            'location' => 'Embarquement Gorée',
            'type' => 'pda',
            'device_identifier' => 'PDA-GOR-01',
        ]);
    }
}
