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
            'is_active' => true,
        ]);

        $beer = \App\Models\Ship::create([
            'name' => 'Béer',
            'company' => ' Liaison Maritime Dakar-Gorée',
            'type' => 'ferry',
            'capacity_pax' => 150,
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
            'name' => 'Badge Mensuel Illimité',
            'price' => 30000,
            'duration_days' => 30,
            'period' => 'MENSUEL',
            'category' => 'BADGE',
            'credit_type' => 'unlimited',
            'allow_multi_passenger' => false,
            'features' => ['Traversées illimitées', 'Accès prioritaire'],
        ]);

        \App\Models\SubscriptionPlan::create([
            'name' => 'Pass 10 Voyages',
            'price' => 12000,
            'duration_days' => 90,
            'period' => 'MENSUEL',
            'category' => 'BADGE',
            'credit_type' => 'counted',
            'voyage_credits' => 10,
            'allow_multi_passenger' => true,
            'features' => ['10 voyages inclus', 'Valable 3 mois', 'Multi-accès autorisé'],
        ]);

        \App\Models\SubscriptionPlan::create([
            'name' => 'Pass Annuel Résident',
            'price' => 250000,
            'duration_days' => 365,
            'period' => 'ANNUEL',
            'category' => 'BADGE',
            'credit_type' => 'unlimited',
            'allow_multi_passenger' => false,
            'features' => ['Illimité', 'Service premium', 'Bagage gratuit'],
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
