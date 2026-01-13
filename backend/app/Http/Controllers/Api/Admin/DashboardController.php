<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function cashierStats(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        // Stats specific to the cashier
        $revenueToday = Booking::where('created_at', '>=', $today)
            ->where('status', 'confirmed')
            ->where('user_id', $user->id) // Assuming user_id in bookings refers to the cashier if sold via POS
            ->orWhere(function($query) use ($user, $today) {
                $query->where('created_at', '>=', $today)
                      ->where('status', 'confirmed')
                      ->whereHas('cashSession', function($q) use ($user) {
                          $q->where('user_id', $user->id);
                      });
            })
            ->sum('total_amount') ?? 0;

        $bookingsToday = Booking::where('created_at', '>=', $today)
            ->where(function($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhereHas('cashSession', function($q) use ($user) {
                          $q->where('user_id', $user->id);
                      });
            })
            ->count() ?? 0;

        // Statistics for yesterday for comparison
        $revenueYesterday = Booking::where('created_at', '>=', $yesterday)
            ->where('created_at', '<', $today)
            ->where('status', 'confirmed')
            ->where(function($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhereHas('cashSession', function($q) use ($user) {
                          $q->where('user_id', $user->id);
                      });
            })
            ->sum('total_amount') ?? 0;

        $bookingsYesterday = Booking::where('created_at', '>=', $yesterday)
            ->where('created_at', '<', $today)
            ->where(function($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhereHas('cashSession', function($q) use ($user) {
                          $q->where('user_id', $user->id);
                      });
            })
            ->count() ?? 0;

        return response()->json([
            'revenue_today' => (float)$revenueToday,
            'revenue_change' => $this->calculateChange((float)$revenueToday, (float)$revenueYesterday),
            'bookings_today' => (int)$bookingsToday,
            'bookings_change' => $this->calculateChange((int)$bookingsToday, (int)$bookingsYesterday),
            'cashier_name' => $user->name,
            'cash_desk' => $user->cashDesk ? $user->cashDesk->load('port') : null,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    public function stats()
    {
        $start = microtime(true);
        $cacheKey = 'admin_dashboard_stats';
        $fromCache = \Illuminate\Support\Facades\Cache::has($cacheKey);

        $result = \Illuminate\Support\Facades\Cache::remember($cacheKey, 60, function () {
            // ... (logique existante) ...
            $today = Carbon::today();
            $yesterday = Carbon::yesterday();
            $revenueToday = Booking::where('created_at', '>=', $today)->where('status', 'confirmed')->sum('total_amount') ?? 0;
            $bookingsToday = Booking::where('created_at', '>=', $today)->count() ?? 0;
            $revenueYesterday = Booking::where('created_at', '>=', $yesterday)->where('created_at', '<', $today)->where('status', 'confirmed')->sum('total_amount') ?? 0;
            $bookingsYesterday = Booking::where('created_at', '>=', $yesterday)->where('created_at', '<', $today)->count() ?? 0;
            $newClientsToday = User::where('created_at', '>=', $today)->count();
            $fillRate = 0;
            $tripsCount = Trip::where('departure_time', '>=', $today)->where('departure_time', '<', $today->copy()->addDay())->count();
            if ($tripsCount > 0) {
                $fillRateData = Trip::where('departure_time', '>=', $today)
                    ->where('departure_time', '<', $today->copy()->addDay())
                    ->join('ships', 'trips.ship_id', '=', 'ships.id')
                    ->selectRaw('AVG(CASE WHEN ships.capacity_pax > 0 THEN (ships.capacity_pax - trips.available_seats_pax) * 100.0 / ships.capacity_pax ELSE 0 END) as avg_fill_rate')
                    ->first();
                $fillRate = $fillRateData->avg_fill_rate ?? 0;
            }

            return [
                'revenue_today' => (float)$revenueToday,
                'revenue_change' => $this->calculateChange((float)$revenueToday, (float)$revenueYesterday),
                'bookings_today' => (int)$bookingsToday,
                'bookings_change' => $this->calculateChange((int)$bookingsToday, (int)$bookingsYesterday),
                'new_clients_today' => $newClientsToday,
                'fill_rate_today' => round($fillRate, 1),
                'source' => 'live'
            ];
        });

        $result['from_cache'] = $fromCache;
        if ($fromCache) {
            $result['source'] = 'cache';
        }
        
        $executionTime = round((microtime(true) - $start) * 1000);
        $result['internal_time_ms'] = $executionTime;

        return response()->json($result);
    }

    private function calculateChange($current, $previous)
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }
        return round((($current - $previous) / $previous) * 100, 1);
    }
}
