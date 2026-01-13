<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory, HasUuids;

    // Passenger Type Constants
    public const TYPE_ADULT = 'adult';
    public const TYPE_CHILD = 'child';
    public const TYPE_BABY = 'baby';

    // Nationality Group Constants
    public const NATIONALITY_NATIONAL = 'national';
    public const NATIONALITY_RESIDENT = 'resident';
    public const NATIONALITY_AFRICAN = 'african';
    public const NATIONALITY_HORS_AFRIQUE = 'hors_afrique';

    // Labels for display
    public const TYPE_LABELS = [
        self::TYPE_ADULT => 'Adulte',
        self::TYPE_CHILD => 'Enfant',
        self::TYPE_BABY => 'Bébé',
    ];

    public const NATIONALITY_LABELS = [
        self::NATIONALITY_NATIONAL => 'National/CEDEAO',
        self::NATIONALITY_RESIDENT => 'Résident',
        self::NATIONALITY_AFRICAN => 'Africain',
        self::NATIONALITY_HORS_AFRIQUE => 'Étranger',
    ];

    protected $fillable = [
        'booking_id',
        'trip_id',
        'return_trip_id',
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

    public function returnTrip()
    {
        return $this->belongsTo(Trip::class, 'return_trip_id');
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
