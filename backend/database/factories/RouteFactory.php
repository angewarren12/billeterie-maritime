<?php

namespace Database\Factories;

use App\Models\Port;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Route>
 */
class RouteFactory extends Factory
{
    public function definition(): array
    {
        return [
            'departure_port_id' => Port::factory(),
            'arrival_port_id' => Port::factory(),
            'duration_minutes' => $this->faker->numberBetween(30, 120),
            'is_active' => true,
        ];
    }
}
