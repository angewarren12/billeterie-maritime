<?php

namespace Database\Factories;

use App\Models\Route;
use App\Models\Ship;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Trip>
 */
class TripFactory extends Factory
{
    public function definition(): array
    {
        return [
            'route_id' => Route::factory(),
            'ship_id' => Ship::factory(),
            'departure_time' => $this->faker->dateTimeBetween('now', '+1 week'),
            'arrival_time' => $this->faker->dateTimeBetween('+1 week', '+2 weeks'),
            'status' => 'scheduled',
            'available_seats_pax' => 100,
            'pricing_settings' => [],
        ];
    }
}
