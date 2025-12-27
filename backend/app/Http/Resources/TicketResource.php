<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
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
            'booking_id' => $this->booking_id,
            'trip' => new TripResource($this->whenLoaded('trip')),
            'passenger_name' => $this->passenger_name,
            'passenger_type' => $this->passenger_type,
            'nationality_group' => $this->nationality_group,
            'qr_code_data' => $this->qr_code_data,
            'status' => $this->status,
            'price_paid' => $this->price_paid,
            'used_at' => $this->used_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
