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
                    'current_credit' => $sub->current_credit,
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
                    'current_credit' => $sub->current_credit,
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
