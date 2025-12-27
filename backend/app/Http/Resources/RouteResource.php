<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RouteResource extends JsonResource
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
            'departure_port' => new PortResource($this->whenLoaded('departurePort')),
            'arrival_port' => new PortResource($this->whenLoaded('arrivalPort')),
            'departure_port_id' => $this->departure_port_id,
            'arrival_port_id' => $this->arrival_port_id,
            'duration_minutes' => $this->duration_minutes,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
