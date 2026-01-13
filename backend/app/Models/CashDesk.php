<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CashDesk extends Model
{
    protected $fillable = [
        'name',
        'code',
        'port_id',
        'is_active',
    ];

    public function port()
    {
        return $this->belongsTo(Port::class);
    }

    public function agents()
    {
        return $this->hasMany(User::class);
    }
}
