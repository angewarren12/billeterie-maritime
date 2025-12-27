<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            // Annuels
            ['name' => 'GOREEN ADULTE', 'price' => 7200, 'duration_days' => 365, 'period' => 'ANNUEL', 'category' => 'GOREEN'],
            ['name' => 'GOREEN ENFANT', 'price' => 3600, 'duration_days' => 365, 'period' => 'ANNUEL', 'category' => 'GOREEN'],
            ['name' => 'MARIAMA BA ADULTE', 'price' => 6000, 'duration_days' => 365, 'period' => 'ANNUEL', 'category' => 'MARIAMA BA'],
            ['name' => 'MARIAMA BA ENFANT', 'price' => 3000, 'duration_days' => 365, 'period' => 'ANNUEL', 'category' => 'MARIAMA BA'],
            ['name' => '3EME AGE', 'price' => 0, 'duration_days' => 365, 'period' => 'ANNUEL', 'category' => '3EME AGE'],

            // Mensuels
            ['name' => 'COMMERCANT', 'price' => 8000, 'duration_days' => 30, 'period' => 'MENSUEL', 'category' => 'PROFESSIONNEL'],
            ['name' => 'FONCTIONNAIRE', 'price' => 1000, 'duration_days' => 30, 'period' => 'MENSUEL', 'category' => 'PROFESSIONNEL'],
            ['name' => 'GOREEN ADULTE', 'price' => 600, 'duration_days' => 30, 'period' => 'MENSUEL', 'category' => 'GOREEN'],
            ['name' => 'GOREEN ENFANT', 'price' => 300, 'duration_days' => 30, 'period' => 'MENSUEL', 'category' => 'GOREEN'],
            ['name' => 'RESTAURATEUR', 'price' => 5000, 'duration_days' => 30, 'period' => 'MENSUEL', 'category' => 'PROFESSIONNEL'],
            ['name' => '3EME AGE (MENSUEL)', 'price' => 0, 'duration_days' => 30, 'period' => 'MENSUEL', 'category' => '3EME AGE'],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['name' => $plan['name'], 'period' => $plan['period']],
                $plan
            );
        }
    }
}
