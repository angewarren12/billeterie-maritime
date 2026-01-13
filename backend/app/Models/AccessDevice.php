<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccessDevice extends Model
{
    use HasFactory;

    protected $fillable = [
        'port_id',
        'name',
        'location',
        'type',
        'device_identifier',
        'api_token',
    ];

    public function port()
    {
        return $this->belongsTo(Port::class);
    }

    public function accessLogs()
    {
        return $this->hasMany(AccessLog::class, 'device_id');
    }
}
