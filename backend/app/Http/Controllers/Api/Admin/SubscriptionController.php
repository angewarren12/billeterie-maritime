<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    /**
     * Liste de tous les abonnements (Badges)
     */
    public function index(Request $request): JsonResponse
    {
        $start = microtime(true);
        $query = Subscription::with(['user', 'plan']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('rfid_card_id', 'like', "%{$search}%");
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $subscriptions = $query->latest()->paginate(20);

        return response()->json([
            'data' => $subscriptions,
            'internal_time_ms' => round((microtime(true) - $start) * 1000)
        ]);
    }

    /**
     * Détails d'un abonnement
     */
    public function show(Subscription $subscription): JsonResponse
    {
        $start = microtime(true);
        return response()->json([
            'data' => $subscription->load(['user', 'plan', 'accessLogs.device']),
            'internal_time_ms' => round((microtime(true) - $start) * 1000)
        ]);
    }

    /**
     * Associer un ID de carte physique (RFID Tag)
     */
    public function associateRfid(Request $request, Subscription $subscription): JsonResponse
    {
        $validated = $request->validate([
            'rfid_card_id' => 'required|string|unique:subscriptions,rfid_card_id,' . $subscription->id,
        ]);

        $subscription->update([
            'rfid_card_id' => $validated['rfid_card_id']
        ]);

        return response()->json([
            'message' => 'Badge RFID associé avec succès',
            'data' => $subscription
        ]);
    }

    /**
     * Marquer l'abonnement comme livré (badge remis)
     */
    public function deliver(Subscription $subscription): JsonResponse
    {
        $subscription->update([
            'is_delivered' => true,
            'delivered_at' => now(),
        ]);

        return response()->json([
            'message' => 'Badge marqué comme livré',
            'data' => $subscription
        ]);
    }

    /**
     * Mettre à jour le statut (bloquer/débloquer)
     */
    public function updateStatus(Request $request, Subscription $subscription): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:active,blocked,expired'
        ]);

        $subscription->update([
            'status' => $validated['status']
        ]);

        return response()->json([
            'message' => 'Statut mis à jour',
            'data' => $subscription
        ]);
    }
}
