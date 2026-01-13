<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'trip_id',
        'user_id',
        'cash_desk_id',
        'booking_reference',
        'total_amount',
        'status',
        'cash_session_id',
    ];

    public function cashDesk()
    {
        return $this->belongsTo(CashDesk::class);
    }

    public function cashSession()
    {
        return $this->belongsTo(CashSession::class);
    }

    protected $casts = [
        'total_amount' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }
}
