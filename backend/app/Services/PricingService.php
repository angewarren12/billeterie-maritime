<?php

namespace App\Services;

use App\Models\PricingRule;
use App\Models\Route;

class PricingService
{
    /**
     * Calcule le prix total pour une configuration donnée.
     *
     * @param int $routeId
     * @param string $passengerType (adult, child, baby)
     * @param string $nationalityGroup (national, resident, non-resident)
     * @return array{total: float, base: float, tax: float, detail: string}
     */
    public function calculatePrice(int $routeId, string $passengerType, string $nationalityGroup): array
    {
        $cacheKey = "pricing_{$routeId}_{$passengerType}_{$nationalityGroup}";

        $rule = \Illuminate\Support\Facades\Cache::remember($cacheKey, 3600, function () use ($routeId, $passengerType, $nationalityGroup) {
            return PricingRule::where('route_id', $routeId)
                ->where('passenger_type', $passengerType)
                ->where('nationality_group', $nationalityGroup)
                ->where('is_active', true)
                ->first();
        });

        // 2. Fallback: Chercher une règle plus générique si nécessaire
        // Exemple: Si pas de prix "Résident", utiliser "Non-Résident" ou défaut ?
        // Pour l'instant, on exige une règle exacte ou on retourne 0/erreur.
        
        if (!$rule) {
            // Tentative de fallback sur "adulte" + "national" comme base de référence ? 
            // Risqué. Mieux vaut lever une exception ou retourner null pour forcer la config.
            
            // Pour le dev, on loggera ou on retournera une structure vide signifiant "Indisponible"
            return [
                'total' => 0,
                'base' => 0,
                'tax' => 0,
                'currency' => 'FCFA',
                'found' => false,
                'error' => "Aucun tarif configuré pour $passengerType / $nationalityGroup sur ce trajet."
            ];
        }

        return [
            'total' => $rule->base_price + $rule->tax_amount,
            'base' => $rule->base_price,
            'tax' => $rule->tax_amount,
            'currency' => 'FCFA',
            'found' => true,
            'rule_id' => $rule->id
        ];
    }
}
