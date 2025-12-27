<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TripResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'route' => new RouteResource($this->whenLoaded('route')),
            'ship' => new ShipResource($this->whenLoaded('ship')),
            'route_id' => $this->route_id,
            'ship_id' => $this->ship_id,
            'departure_time' => $this->departure_time,
            'arrival_time' => $this->arrival_time,
            'status' => $this->status,
            'available_seats_pax' => $this->available_seats_pax,
            'available_slots_vehicles' => $this->available_slots_vehicles,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
