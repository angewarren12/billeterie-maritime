<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PricingRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'route_id',
        'passenger_type',
        'nationality_group',
        'base_price',
        'tax_amount',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'base_price' => 'decimal:2',
        'tax_amount' => 'decimal:2',
    ];

    // Constants for consistency and easier UI generation
    const TYPE_ADULT = 'adult';
    const TYPE_CHILD = 'child';
    const TYPE_BABY = 'baby';

    const GROUP_NATIONAL = 'national';
    const GROUP_RESIDENT = 'resident';
    const GROUP_AFRICAN = 'african';
    const GROUP_HORS_AFRIQUE = 'hors_afrique';

    public static function getPassengerTypes(): array
    {
        return [
            self::TYPE_ADULT => 'Adulte (15 ans & +)',
            self::TYPE_CHILD => 'Enfant (5 à 14 ans)',
            self::TYPE_BABY => 'Bébé (0 à 4 ans)',
        ];
    }

    public static function getNationalityGroups(): array
    {
        return [
            self::GROUP_NATIONAL => 'Sénégalais (National)',
            self::GROUP_RESIDENT => 'Résident (Sénégal)',
            self::GROUP_AFRICAN => 'Résident Afrique',
            self::GROUP_HORS_AFRIQUE => 'Non-résident Afrique',
        ];
    }

    public function route()
    {
        return $this->belongsTo(Route::class);
    }
}
