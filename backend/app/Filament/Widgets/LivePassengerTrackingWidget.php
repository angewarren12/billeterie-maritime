<?php

namespace App\Filament\Widgets;

use App\Models\Trip;
use App\Models\Ticket;
use Filament\Widgets\Widget;
use Illuminate\Support\Facades\DB;

class LivePassengerTrackingWidget extends Widget
{
    protected string $view = 'filament.widgets.live-passenger-tracking';
    
    protected static ?int $sort = 2;
    
    protected int | string | array $columnSpan = 'full';

    // Refresh every 30 seconds to drastically reduce load
    protected static ?string $pollingInterval = '30s';

    public function getCurrentTrips()
    {
        return Trip::with(['route.departurePort', 'route.arrivalPort', 'ship'])
            ->where('status', 'boarding')
            ->orWhere(function($q) {
                $q->where('departure_time', '>=', now()->subHours(1))
                  ->where('departure_time', '<=', now()->addHours(1))
                  ->where('status', 'scheduled');
            })
            ->orderBy('departure_time')
            ->get()
            ->map(function($trip) {
                $totalTickets = Ticket::where('trip_id', $trip->id)->count();
                $usedTickets = Ticket::where('trip_id', $trip->id)
                    ->where('status', 'used')
                    ->count();
                $pendingTickets = $totalTickets - $usedTickets;
                
                $capacity = $trip->ship->capacity_pax;
                $boarded = $usedTickets;
                $remaining = $capacity - $boarded;
                $boardingProgress = $capacity > 0 ? ($boarded / $capacity) * 100 : 0;

                return [
                    'id' => $trip->id,
                    'departure' => $trip->route->departurePort->name,
                    'arrival' => $trip->route->arrivalPort->name,
                    'ship' => $trip->ship->name,
                    'departure_time' => $trip->departure_time->format('H:i'),
                    'status' => $trip->status,
                    'capacity' => $capacity,
                    'boarded' => $boarded,
                    'remaining' => $remaining,
                    'pending_tickets' => $pendingTickets,
                    'boarding_progress' => round($boardingProgress, 1),
                    'status_color' => match($trip->status) {
                        'boarding' => 'warning',
                        'departed' => 'success',
                        'scheduled' => 'info',
                        default => 'gray'
                    },
                    'progress_color' => $boardingProgress >= 80 ? 'success' : 
                                       ($boardingProgress >= 50 ? 'warning' : 'info'),
                ];
            });
    }

    public function getRecentBoardings()
    {
        return Ticket::with(['trip.route.departurePort', 'trip.route.arrivalPort'])
            ->where('status', 'used')
            ->where('used_at', '>=', now()->subMinutes(30))
            ->orderBy('used_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($ticket) {
                return [
                    'passenger' => $ticket->passenger_name,
                    'trip' => "{$ticket->trip->route->departurePort->name} → {$ticket->trip->route->arrivalPort->name}",
                    'time' => $ticket->used_at->diffForHumans(),
                    'type' => $ticket->passenger_type,
                ];
            });
    }
}
