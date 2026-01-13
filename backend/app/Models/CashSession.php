<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CashSession extends Model
{
    use \Illuminate\Database\Eloquent\Concerns\HasUuids;

    protected $fillable = [
        'user_id',
        'cash_desk_id',
        'opening_amount',
        'expected_amount',
        'closing_amount_declared',
        'discrepancy_amount',
        'status',
        'notes',
        'opened_at',
        'closed_at',
    ];

    protected $casts = [
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
        'opening_amount' => 'decimal:2',
        'expected_amount' => 'decimal:2',
        'closing_amount_declared' => 'decimal:2',
        'discrepancy_amount' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function cashDesk()
    {
        return $this->belongsTo(CashDesk::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'cash_session_id');
    }
}
