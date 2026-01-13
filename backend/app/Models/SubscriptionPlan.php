<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    use HasFactory;

    public const TYPE_UNLIMITED = 'unlimited';
    public const TYPE_COUNTED = 'counted';

    protected $fillable = [
        'name',
        'price',
        'duration_days',
        'period',
        'category',
        'description',
        'features',
        'is_active',
        'voyage_credits',
        'credit_type',
        'allow_multi_passenger',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'voyage_credits' => 'integer',
        'features' => 'array',
        'allow_multi_passenger' => 'boolean',
    ];

    public function subscriptions()
    {   
        return $this->hasMany(Subscription::class, 'plan_id');
    }
}
