<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Cache;
use App\Models\Route;
use App\Models\Port;
use App\Models\SubscriptionPlan;

class CacheHelper
{
    /**
     * Cache TTL constants (in seconds)
     */
    const TTL_ROUTES = 3600; // 1 hour
    const TTL_PORTS = 86400; // 24 hours
    const TTL_PLANS = 86400; // 24 hours

    /**
     * Get all routes with eager loaded ports
     */
    public static function getRoutes(): \Illuminate\Database\Eloquent\Collection
    {
        return Cache::remember('routes.all', self::TTL_ROUTES, function () {
            return Route::with(['departurePort', 'arrivalPort'])->get();
        });
    }

    /**
     * Get all ports
     */
    public static function getPorts(): \Illuminate\Database\Eloquent\Collection
    {
        return Cache::remember('ports.all', self::TTL_PORTS, function () {
            return Port::orderBy('name')->get();
        });
    }

    /**
     * Get all subscription plans
     */
    public static function getSubscriptionPlans(): \Illuminate\Database\Eloquent\Collection
    {
        return Cache::remember('subscription_plans.all', self::TTL_PLANS, function () {
            return SubscriptionPlan::where('is_active', true)->get();
        });
    }

    /**
     * Clear all cached data
     */
    public static function clearAll(): void
    {
        Cache::forget('routes.all');
        Cache::forget('ports.all');
        Cache::forget('subscription_plans.all');
    }

    /**
     * Clear specific cache
     */
    public static function clearRoutes(): void
    {
        Cache::forget('routes.all');
    }

    public static function clearPorts(): void
    {
        Cache::forget('ports.all');
    }

    public static function clearPlans(): void
    {
        Cache::forget('subscription_plans.all');
    }
}
