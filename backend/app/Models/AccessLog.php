<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccessLog extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'ticket_id',
        'subscription_id',
        'device_id',
        'direction',
        'result',
        'deny_reason',
        'scanned_at',
    ];

    protected $casts = [
        'scanned_at' => 'datetime',
    ];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }

    public function device()
    {
        return $this->belongsTo(AccessDevice::class, 'device_id');
    }
}
