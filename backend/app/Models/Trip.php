<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trip extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'route_id',
        'ship_id',
        'departure_time',
        'arrival_time',
        'status',
        'available_seats_pax',
        'available_slots_vehicles',
        'images',
        'description',
    ];

    protected $casts = [
        'departure_time' => 'datetime',
        'arrival_time' => 'datetime',
        'images' => 'json',
    ];

    public function route()
    {
        return $this->belongsTo(Route::class);
    }

    public function ship()
    {
        return $this->belongsTo(Ship::class);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }
}
