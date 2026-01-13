<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    /**
     * Récupère tous les abonnements actifs de l'utilisateur connecté
     */
    public function active(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'subscriptions' => [],
                'has_active_subscription' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }

        $subscriptions = Subscription::getAllActiveForUser($user->id);

        if ($subscriptions->isEmpty()) {
            return response()->json([
                'subscriptions' => [],
                'has_active_subscription' => false
            ]);
        }

        return response()->json([
            'subscriptions' => $subscriptions->map(function ($sub) {
                return [
                    'id' => $sub->id,
                    'plan_name' => $sub->plan->name,
                    'plan' => $sub->plan,
                    'legacy_credit_fcfa' => $sub->legacy_credit_fcfa,
                    'voyage_credits_remaining' => $sub->voyage_credits_remaining,
                    'voyage_credits_initial' => $sub->voyage_credits_initial,
                    'rfid_card_id' => $sub->rfid_card_id,
                    'start_date' => $sub->start_date->format('Y-m-d'),
                    'end_date' => $sub->end_date->format('Y-m-d'),
                    'status' => $sub->status,
                ];
            }),
            'has_active_subscription' => true
        ]);
    }

    /**
     * Liste tous les abonnements de l'utilisateur (historique)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $subscriptions = Subscription::where('user_id', $user->id)
            ->with('plan')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($sub) {
                return [
                    'id' => $sub->id,
                    'plan_name' => $sub->plan->name,
                    'plan' => $sub->plan,
                    'legacy_credit_fcfa' => $sub->legacy_credit_fcfa,
                    'voyage_credits_remaining' => $sub->voyage_credits_remaining,
                    'voyage_credits_initial' => $sub->voyage_credits_initial,
                    'rfid_card_id' => $sub->rfid_card_id,
                    'start_date' => $sub->start_date->format('Y-m-d'),
                    'end_date' => $sub->end_date->format('Y-m-d'),
                    'status' => $sub->status,
                ];
            });

        return response()->json([
            'subscriptions' => $subscriptions
        ]);
    }
}
