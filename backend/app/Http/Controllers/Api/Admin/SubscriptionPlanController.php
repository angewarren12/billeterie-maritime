<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SubscriptionPlanController extends Controller
{
    private $cacheKey = 'admin_subscription_plans_all';

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $start = microtime(true);
        
        $plans = Cache::remember($this->cacheKey, 3600, function () {
            return SubscriptionPlan::orderBy('period')
                ->orderBy('price')
                ->get();
        });
            
        return response()->json([
            'data' => $plans,
            'internal_time_ms' => round((microtime(true) - $start) * 1000)
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'duration_days' => 'required|integer|min:1',
            'period' => 'required|in:ANNUEL,MENSUEL', 
            'category' => 'nullable|string',
            'description' => 'nullable|string',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
            'voyage_credits' => 'nullable|integer|min:0',
            'credit_type' => 'required|in:unlimited,counted',
        ]);

        $plan = SubscriptionPlan::create($validated);
        Cache::forget($this->cacheKey);

        return response()->json([
            'message' => 'Plan créé avec succès',
            'data' => $plan
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $plan = SubscriptionPlan::findOrFail($id);
        return response()->json(['data' => $plan]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $plan = SubscriptionPlan::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'price' => 'sometimes|numeric|min:0',
            'duration_days' => 'sometimes|integer|min:1',
            'period' => 'sometimes|in:ANNUEL,MENSUEL',
            'category' => 'nullable|string',
            'description' => 'nullable|string',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
            'voyage_credits' => 'nullable|integer|min:0',
            'credit_type' => 'sometimes|in:unlimited,counted',
        ]);

        $plan->update($validated);
        Cache::forget($this->cacheKey);

        return response()->json([
            'message' => 'Plan mis à jour avec succès',
            'data' => $plan
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $plan = SubscriptionPlan::findOrFail($id);
        
        // Check if subscriptions exist
        if ($plan->subscriptions()->exists()) {
            // Soft delete logic or just deactivate
            $plan->update(['is_active' => false]);
            Cache::forget($this->cacheKey);
            return response()->json([
                'message' => 'Le plan a été désactivé car des abonnements y sont liés.'
            ]);
        }

        $plan->delete();
        Cache::forget($this->cacheKey);

        return response()->json([
            'message' => 'Plan supprimé avec succès'
        ]);
    }
}
