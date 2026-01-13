<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Ship>
 */
class ShipFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->name,
            'company' => $this->faker->company,
            'type' => 'Ferry',
            'capacity_pax' => $this->faker->numberBetween(50, 500),
            'capacity_freight' => 0,
            'is_active' => true,
        ];
    }
}
