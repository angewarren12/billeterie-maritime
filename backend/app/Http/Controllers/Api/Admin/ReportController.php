<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Ticket;
use App\Models\Transaction;
use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Rapport des ventes
     * 
     * GET /api/admin/reports/sales
     */
    /**
     * Statistiques d'un guichet pour le Rapport Z
     */
    public function cashDeskStats(Request $request, $cashDeskId): \Illuminate\Http\JsonResponse
    {
        $date = $request->query('date', now()->toDateString());
        
        $stats = Transaction::whereHas('booking', function($q) use ($cashDeskId) {
                $q->where('cash_desk_id', $cashDeskId);
            })
            ->whereDate('created_at', $date)
            ->where('status', 'completed')
            ->selectRaw('payment_method, SUM(amount) as revenue, COUNT(*) as count')
            ->groupBy('payment_method')
            ->get();

        $totalRevenue = $stats->sum('revenue');
        $totalTransactions = $stats->sum('count');

        return response()->json([
            'cash_desk_id' => $cashDeskId,
            'date' => $date,
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_transactions' => $totalTransactions
            ],
            'details' => $stats
        ]);
    }

    public function sales(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'group_by' => 'in:day,month,payment_method',
        ]);

        $start = Carbon::parse($validated['start_date'])->startOfDay();
        $end = Carbon::parse($validated['end_date'])->endOfDay();
        $groupBy = $validated['group_by'] ?? 'day';

        $query = Transaction::whereBetween('created_at', [$start, $end])
            ->where('status', 'completed');

        // Totaux globaux
        $totalRevenue = (clone $query)->sum('amount');
        $totalTransactions = (clone $query)->count();

        // Données groupées
        $data = [];
        if ($groupBy === 'day') {
            $data = (clone $query)
                ->selectRaw('DATE(created_at) as date, SUM(amount) as revenue, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get();
        } elseif ($groupBy === 'payment_method') {
            $data = (clone $query)
                ->selectRaw('payment_method, SUM(amount) as revenue, COUNT(*) as count')
                ->groupBy('payment_method')
                ->orderBy('revenue', 'desc')
                ->get();
        }

        return response()->json([
            'period' => [
                'start' => $start->toDateString(),
                'end' => $end->toDateString()
            ],
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_transactions' => $totalTransactions
            ],
            'chart_data' => $data
        ]);
    }

    /**
     * Manifeste passager pour un voyage
     * 
     * GET /api/admin/reports/manifest/{trip}
     */
    public function manifest(string $tripId)
    {
        $trip = Trip::with(['route', 'ship'])->findOrFail($tripId);

        $tickets = Ticket::where('trip_id', $trip->id)
            ->whereIn('status', ['issued', 'boarded'])
            ->with(['booking.user'])
            ->orderBy('passenger_name')
            ->get();

        // Statistiques du manifeste
        $stats = [
            'total_pax' => $tickets->count(),
            'boarded' => $tickets->where('status', 'boarded')->count(),
            'adults' => $tickets->where('passenger_type', 'adult')->count(),
            'children' => $tickets->whereIn('passenger_type', ['child', 'baby'])->count(),
        ];

        // Liste formatée pour export/affichage
        $manifest = $tickets->map(function ($ticket) {
            return [
                'ticket_id' => $ticket->qr_code_data,
                'name' => $ticket->passenger_name,
                'type' => $ticket->passenger_type,
                'nationality' => $ticket->nationality_group,
                'status' => $ticket->status,
                'seat' => $ticket->seat_number ?? '-',
                'contact' => $ticket->booking->user ? $ticket->booking->user->email : ($ticket->booking->contact_email ?? '-'),
                'booking_ref' => $ticket->booking->booking_reference
            ];
        });

        return response()->json([
            'trip' => [
                'id' => $trip->id,
                'route' => $trip->route->name,
                'ship' => $trip->ship->name,
                'departure' => $trip->departure_time,
                'capacity' => $trip->ship->capacity_pax
            ],
            'stats' => $stats,
            'passengers' => $manifest
        ]);
    }
}
