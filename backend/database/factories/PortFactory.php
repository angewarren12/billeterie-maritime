<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Port>
 */
class PortFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->city,
            'code' => strtoupper($this->faker->lexify('???')),
            'city' => $this->faker->city,
            'country' => 'Senegal',
        ];
    }
}
