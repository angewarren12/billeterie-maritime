<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'plan_id',
        'rfid_card_id',
        'start_date',
        'end_date',
        'status',
        'legacy_credit_fcfa',
        'voyage_credits_initial',
        'voyage_credits_remaining',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'legacy_credit_fcfa' => 'decimal:2',
        'voyage_credits_initial' => 'integer',
        'voyage_credits_remaining' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function plan()
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    public function accessLogs()
    {
        return $this->hasMany(AccessLog::class);
    }

    /**
     * Vérifie si l'abonnement est actif
     */
    public function isActive(): bool
    {
        // Si c'est un plan illimité (BADGE)
        if ($this->plan && $this->plan->credit_type === 'unlimited') {
            return $this->status === 'active' && $this->end_date >= now();
        }

        // Si c'est un plan à crédits (TICKET)
        if ($this->voyage_credits_initial > 0) {
            return $this->status === 'active' 
                && $this->end_date >= now()
                && $this->voyage_credits_remaining > 0;
        }

        // Fallback: Ancien système FCFA
        return $this->status === 'active' 
            && $this->end_date >= now()
            && $this->legacy_credit_fcfa > 0;
    }

    /**
     * Vérifie si l'abonnement peut couvrir un certain montant
     */
    public function canCoverAmount(float $amount): bool
    {
        return $this->isActive() && $this->current_credit >= $amount;
    }

    /**
     * Déduit un montant du solde de l'abonnement
     */
    public function deductAmount(float $amount): void
    {
        if (!$this->canCoverAmount($amount)) {
            throw new \Exception("Solde d'abonnement insuffisant");
        }

        $this->decrement('legacy_credit_fcfa', $amount);
    }

    /**
     * Legacy Wrapper (Obsolète)
     */
    /**
     * Vérifie si l'abonnement peut couvrir un certain nombre de voyages
     */
    public function canCoverTrips(int $tripCount = 1): bool
    {
        if (!$this->plan) return false;

        // Illimité
        if ($this->plan->credit_type === 'unlimited') {
            return $this->isActive();
        }

        // Système de crédits
        if ($this->voyage_credits_initial > 0) {
            return $this->isActive() && $this->voyage_credits_remaining >= $tripCount;
        }

        // Ancien système FCFA (ne supporte pas trip count, mais on peut imaginer)
        return false;
    }

    /**
     * Déduit X crédits voyage
     */
    public function deductTripCredits(int $count = 1): void
    {
        if ($this->plan && $this->plan->credit_type === 'unlimited') {
            return; // Rien à déduire
        }

        if (!$this->canCoverTrips($count)) {
            throw new \Exception("Crédits voyage insuffisants");
        }

        $this->decrement('voyage_credits_remaining', $count);
    }

    /**
     * Récupère l'abonnement actif d'un utilisateur
     */
    public static function getActiveForUser(int $userId): ?self
    {
        // Simpification: on retourne le premier abonnement qui est "isActive()"
        // Cela permet de gérer toute la logique complexe dans isActive()
        $subscriptions = self::where('user_id', $userId)
            ->where('status', 'active')
            ->where('end_date', '>=', now())
            ->with('plan')
            ->get();

        foreach ($subscriptions as $sub) {
            if ($sub->isActive()) {
                return $sub;
            }
        }

        return null;
    }

    /**
     * Récupère tous les abonnements actifs d'un utilisateur
     */
    public static function getAllActiveForUser(int $userId)
    {
        $subscriptions = self::where('user_id', $userId)
            ->where('status', 'active')
            ->where('end_date', '>=', now())
            ->with('plan')
            ->get();
        
        // Filtrer via la méthode isActive() PHP pour être sûr
        return $subscriptions->filter(fn($sub) => $sub->isActive());
    }
}
