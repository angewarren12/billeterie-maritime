<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Route extends Model
{
    use HasFactory;

    protected $fillable = [
        'departure_port_id',
        'arrival_port_id',
        'duration_minutes',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $appends = ['name'];

    public function departurePort()
    {
        return $this->belongsTo(Port::class, 'departure_port_id');
    }

    public function arrivalPort()
    {
        return $this->belongsTo(Port::class, 'arrival_port_id');
    }

    /**
     * Get the route name (e.g., "Dakar - Gorée")
     */
    public function getNameAttribute()
    {
        if ($this->departurePort && $this->arrivalPort) {
            return $this->departurePort->name . ' - ' . $this->arrivalPort->name;
        }
        return 'Route #' . $this->id;
    }

    public function trips()
    {
        return $this->hasMany(Trip::class);
    }

    public function pricingRules()
    {
        return $this->hasMany(PricingRule::class);
    }
}
