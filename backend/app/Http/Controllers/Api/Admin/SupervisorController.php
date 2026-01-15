<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\CashDesk;
use App\Models\PosSession;
use App\Models\SupervisorAssignment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SupervisorController extends Controller
{
    /**
     * Get consolidated dashboard stats for the supervisor's station
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $portId = $this->getSupervisorPortId($user);

        // Date range (default: today)
        $startDate = $request->input('start_date', Carbon::today()->toDateString());
        $endDate = $request->input('end_date', Carbon::today()->toDateString());

        // Base query for bookings
        $salesQuery = Booking::query()
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->where('status', 'confirmed');

        // Scoping by Port
        if ($portId) {
            $salesQuery->whereHas('trip.route', function($q) use ($portId) {
                $q->where('departure_port_id', $portId);
            });
        }

        // 1. Total Revenue & Count
        $totalRevenue = (clone $salesQuery)->sum('total_amount') ?? 0;
        $totalTickets = (clone $salesQuery)->count();

        // 2. Active Cash Desks
        $activeCashDesksQuery = CashDesk::query()->where('is_open', true);
        if ($portId) {
            $activeCashDesksQuery->where('port_id', $portId);
        }
        $activeCashDesksCount = $activeCashDesksQuery->count();

        // 3. Hourly Sales (Chart Data)
        $hourlySales = (clone $salesQuery)
            ->selectRaw('HOUR(created_at) as hour, SUM(total_amount) as total')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        return response()->json([
            'overview' => [
                'total_revenue' => $totalRevenue,
                'total_tickets' => $totalTickets,
                'active_cash_desks' => $activeCashDesksCount,
            ],
            'chart_data' => $hourlySales,
            'port_id' => $portId
        ]);
    }

    /**
     * Get list of cash desks with status
     */
    public function cashDesks(Request $request)
    {
        $user = $request->user();
        $portId = $this->getSupervisorPortId($user);

        $query = CashDesk::with(['currentSession.user', 'port']);

        if ($portId) {
            $query->where('port_id', $portId);
        }

        $cashDesks = $query->get()->map(function($desk) {
            return [
                'id' => $desk->id,
                'name' => $desk->name,
                'status' => $desk->is_open ? 'open' : 'closed',
                'port' => $desk->port->name,
                'current_session' => $desk->currentSession ? [
                    'id' => $desk->currentSession->id,
                    'cashier_name' => $desk->currentSession->user->name,
                    'opened_at' => $desk->currentSession->opened_at,
                    'current_total' => $desk->currentSession->current_amount, // Assuming this is calculated or updated
                ] : null
            ];
        });

        return response()->json($cashDesks);
    }

    /**
     * Force close a cash desk session
     */
    public function closeCashDesk(Request $request, $id)
    {
        $user = $request->user();
        
        // Check permission explicitly
        if (!$user->can('supervisor.close_cash_desk_remotely') && !$user->hasRole(['admin', 'super_admin'])) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $session = PosSession::findOrFail($id);
        
        // Check if supervisor owns this port
        $portId = $this->getSupervisorPortId($user);
        if ($portId && $session->cashDesk->port_id !== $portId) {
            return response()->json(['message' => 'Ce guichet ne dépend pas de votre gare.'], 403);
        }

        if ($session->closed_at) {
            return response()->json(['message' => 'Session déjà fermée.'], 400);
        }

        // Close logic
        $session->update([
            'closed_at' => now(),
            'closing_amount_declared' => $session->expected_amount, // Automatic closure assumes perfect match or needs adjustment
            'notes' => "Fermeture administrative par " . $user->name,
            'status' => 'closed_admin'
        ]);

        $session->cashDesk->update(['is_open' => false]);

        return response()->json(['message' => 'Session fermée avec succès.']);
    }

    /**
     * Get detailed sales history
     */
    public function salesHistory(Request $request)
    {
        $user = $request->user();
        $portId = $this->getSupervisorPortId($user);
        
        $query = Booking::with(['user', 'trip.route'])
            ->where('status', 'confirmed')
            ->latest()
            ->limit(50);

        if ($portId) {
            $query->whereHas('trip.route', function($q) use ($portId) {
                $q->where('departure_port_id', $portId);
            });
        }

        return response()->json($query->get());
    }

    /**
     * Helper to get assigned port ID
     */
    private function getSupervisorPortId($user)
    {
        if ($user->hasRole(['super_admin', 'admin', 'manager'])) {
            return null; // Can see everything
        }

        $assignment = SupervisorAssignment::where('user_id', $user->id)->first();
        return $assignment ? $assignment->port_id : null;
    }
}
