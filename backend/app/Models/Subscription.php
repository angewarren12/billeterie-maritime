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
        'current_credit',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'current_credit' => 'decimal:2',
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
        return $this->status === 'active' 
            && $this->end_date >= now()
            && $this->current_credit > 0;
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

        $this->decrement('current_credit', $amount);

        // Si le crédit tombe à 0 ou moins, on peut marquer comme expiré (ou laisser actif pour recharge)
        // Ici on laisse actif tant que la date est valide, car 0 n'est pas forcément "fini" (on peut recharger ?)
        // Mais la logique isActive vérifie > 0.
        if ($this->fresh()->current_credit <= 0) {
             // Optionnel : ne rien faire ou changer le statut
        }
    }

    /**
     * Legacy Wrapper (Obsolète)
     */
    public function canCoverTrips(int $count = 1): bool
    {
        // Ne plus utiliser cette logique
        return false;
    }

    /**
     * Récupère l'abonnement actif d'un utilisateur
     */
    public static function getActiveForUser(int $userId): ?self
    {
        return self::where('user_id', $userId)
            ->where('status', 'active')
            ->where('end_date', '>=', now())
            ->where('current_credit', '>', 0)
            ->with('plan')
            ->first();
    }

    /**
     * Récupère tous les abonnements actifs d'un utilisateur
     */
    public static function getAllActiveForUser(int $userId)
    {
        return self::where('user_id', $userId)
            ->where('status', 'active')
            ->where('end_date', '>=', now())
            ->where('current_credit', '>', 0)
            ->with('plan')
            ->orderBy('current_credit', 'desc')
            ->get();
    }
}
