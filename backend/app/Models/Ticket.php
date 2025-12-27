<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'booking_id',
        'trip_id',
        'passenger_name',
        'passenger_type',
        'nationality_group',
        'qr_code_data',
        'status',
        'price_paid',
        'used_at',
    ];

    protected $casts = [
        'price_paid' => 'decimal:2',
        'used_at' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function accessLogs()
    {
        return $this->hasMany(AccessLog::class);
    }

    /**
     * Generate QR code for this ticket
     */
    public function generateQrCode(): string
    {
        return app(\App\Services\QrCodeService::class)->generateForTicket($this);
    }

    /**
     * Get QR code URL
     */
    public function getQrCodeUrl(): ?string
    {
        return app(\App\Services\QrCodeService::class)->getQrCodeUrl($this);
    }

    /**
     * Check if ticket is valid for use
     */
    public function isValid(): bool
    {
        return in_array($this->status, ['valid', 'issued']) && !$this->used_at;
    }

    /**
     * Mark ticket as used
     */
    public function markAsUsed(): void
    {
        app(\App\Services\QrCodeService::class)->markAsUsed($this);
    }
}
