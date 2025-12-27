<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Port extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'city',
        'country',
    ];

    public function departureRoutes()
    {
        return $this->hasMany(Route::class, 'departure_port_id');
    }

    public function arrivalRoutes()
    {
        return $this->hasMany(Route::class, 'arrival_port_id');
    }
}
