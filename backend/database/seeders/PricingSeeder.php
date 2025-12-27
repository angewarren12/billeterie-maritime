<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Route;
use App\Models\PricingRule;

class PricingSeeder extends Seeder
{
    public function run(): void
    {
        // On ne fait rien ici car MaritimeSeeder gère déjà les tarifs officiels pour Dakar-Gorée.
        // Si d'autres routes sont ajoutées par DummyDataSeeder, on pourrait ajouter des tarifs par défaut ici.
        
        $routes = Route::whereDoesntHave('pricingRules')->get();

        foreach ($routes as $route) {
            $basePrice = 2000;

            $types = [PricingRule::TYPE_ADULT, PricingRule::TYPE_CHILD, PricingRule::TYPE_BABY];
            $groups = [PricingRule::GROUP_NATIONAL, PricingRule::GROUP_RESIDENT, PricingRule::GROUP_AFRICAN, PricingRule::GROUP_HORS_AFRIQUE];

            foreach ($types as $type) {
                foreach ($groups as $group) {
                    $price = $basePrice;
                    if ($type === PricingRule::TYPE_CHILD) $price *= 0.5;
                    if ($type === PricingRule::TYPE_BABY) $price = 0;
                    
                    if ($group === PricingRule::GROUP_AFRICAN) $price *= 2;
                    if ($group === PricingRule::GROUP_HORS_AFRIQUE) $price *= 4;

                    $this->createRule($route->id, $type, $group, $price, 0);
                }
            }
        }
    }

    private function createRule($routeId, $type, $group, $price, $tax)
    {
        PricingRule::firstOrCreate(
            [
                'route_id' => $routeId,
                'passenger_type' => $type,
                'nationality_group' => $group,
            ],
            [
                'base_price' => $price,
                'tax_amount' => $tax,
                'is_active' => true,
            ]
        );
    }
}
