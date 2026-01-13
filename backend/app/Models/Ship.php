<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ship extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'company',
        'type',
        'capacity_pax',
        'is_active',
        'images',
        'description',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'images' => 'json',
    ];

    public function trips()
    {
        return $this->hasMany(Trip::class);
    }
}
