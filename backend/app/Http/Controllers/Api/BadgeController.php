<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Models\Subscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BadgeController extends Controller
{
    /**
     * Liste des types d'abonnements disponibles
     */
    public function index(): JsonResponse
    {
        $plans = \Illuminate\Support\Facades\Cache::remember('badge_plans', 1800, function () {
            return SubscriptionPlan::where('is_active', true)->get();
        });
        
        return response()->json([
            'plans' => $plans
        ]);
    }

    /**
     * Alias pour index (utilisé par /badges/plans)
     */
    public function plans(): JsonResponse
    {
        return $this->index();
    }

    /**
     * Détails de l'abonnement actif de l'utilisateur
     */
    public function mySubscription(Request $request): JsonResponse
    {
        $user = $request->user();
        $subscription = $user->subscriptions()
            ->with('plan')
            ->where('status', 'active')
            ->where('end_date', '>=', now())
            ->first();

        return response()->json([
            'subscription' => $subscription
        ]);
    }

    /**
     * Souscrire à un abonnement
     */
    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
            'payment_method' => 'required|string',
            'delivery_method' => 'required|in:pickup,delivery',
            'delivery_address' => 'required_if:delivery_method,delivery|string|nullable',
            'user_id' => 'nullable|exists:users,id', // Support pour admin qui souscrit pour un tiers
        ]);

        // Si l'utilisateur est admin et qu'un user_id est fourni, on utilise ce dernier
        $currentUser = $request->user();
        $targetUserId = ($currentUser->role === 'admin' && $request->has('user_id')) 
            ? $request->user_id 
            : $currentUser->id;

        $plan = SubscriptionPlan::findOrFail($request->plan_id);

        // Vérifier si l'utilisateur a déjà un abonnement actif pour ce plan
        $existingSubscription = Subscription::where('user_id', $targetUserId)
            ->where('plan_id', $plan->id)
            ->where('status', 'active')
            ->where('end_date', '>=', now())
            ->first();

        if ($existingSubscription) {
            // RENOUVELLEMENT : On prolonge la date de fin et on ajoute les crédits
            $existingSubscription->end_date = \Carbon\Carbon::parse($existingSubscription->end_date)->addDays($plan->duration_days);
            
            if ($plan->credit_type === 'counted') {
                $existingSubscription->voyage_credits_initial += $plan->voyage_credits;
                $existingSubscription->voyage_credits_remaining += $plan->voyage_credits;
            }
            
            $existingSubscription->save();
            $subscription = $existingSubscription;
        } else {
            // NOUVEL ABONNEMENT
            $credits = ($plan->credit_type === 'counted') ? $plan->voyage_credits : 0;
            
            $subscription = Subscription::create([
                'user_id' => $targetUserId,
                'plan_id' => $plan->id,
                'start_date' => now(),
                'end_date' => now()->addDays($plan->duration_days),
                'status' => 'active',
                'legacy_credit_fcfa' => 0,
                'voyage_credits_initial' => $credits,
                'voyage_credits_remaining' => $credits,
                'rfid_card_id' => null,
            ]);
        }

        return response()->json([
            'message' => 'Abonnement réussi',
            'subscription' => $subscription->load('plan')
        ]);
    }
}
