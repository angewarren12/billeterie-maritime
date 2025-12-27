<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
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
        ]);

        $user = $request->user();
        $plan = SubscriptionPlan::findOrFail($request->plan_id);

        // Déterminer le crédit initial basé sur la valeur du plan (Portefeuille)
        // Le crédit correspond au montant en FCFA utilisable pour les voyages
        $initialCredit = $plan->price;

        // Générer un code RFID unique
        $rfid = 'RFID-' . strtoupper(\Illuminate\Support\Str::random(10));

        // Créer l'abonnement
        $subscription = \App\Models\Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'start_date' => now(),
            'end_date' => now()->addDays($plan->duration_days),
            'status' => 'active',
            'current_credit' => $initialCredit,
            'rfid_card_id' => $rfid,
        ]);

        // Note: La transaction sera créée via un système de paiement externe
        // Pour l'instant, on considère le paiement comme validé

        return response()->json([
            'message' => 'Abonnement réussi',
            'subscription' => $subscription->load('plan')
        ]);
    }
}
