<?php

namespace App\Filament\Widgets;

use App\Models\Booking;
use App\Models\Trip;
use App\Models\Ticket;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class ModernStatsWidget extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $today = now()->startOfDay();
        
        // Total bookings today
        $todayBookings = Booking::whereDate('created_at', $today)->count();
        $yesterdayBookings = Booking::whereDate('created_at', $today->copy()->subDay())->count();
        $bookingChange = $yesterdayBookings > 0 ? (($todayBookings - $yesterdayBookings) / $yesterdayBookings) * 100 : 0;

        // Completed trips
        $completedTrips = Trip::where('status', 'completed')->count();
        $totalTrips = Trip::count();

        // Active trips
        $activeTrips = Trip::whereIn('status', ['scheduled', 'boarding', 'departed'])
            ->where('departure_time', '>=', now()->subHours(2))
            ->count();

        // Pending bookings
        $pendingBookings = Booking::where('status', 'pending')->count();

        return [
            Stat::make('Réservations Aujourd\'hui', $todayBookings)
                ->description($bookingChange >= 0 ? "↑ {$bookingChange}% vs hier" : "↓ {$bookingChange}% vs hier")
                ->descriptionIcon($bookingChange >= 0 ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down')
                ->color('success')
                ->chart([12, 18, 15, 22, $todayBookings])
                ->extraAttributes([
                    'class' => 'stat-card-modern',
                ]),

            Stat::make('Traversées Terminées', $completedTrips)
                ->description("Sur {$totalTrips} au total")
                ->descriptionIcon('heroicon-m-check-circle')
                ->color('primary')
                ->extraAttributes([
                    'class' => 'stat-card-modern',
                ]),

            Stat::make('Traversées Actives', $activeTrips)
                ->description('En cours ou à venir')
                ->descriptionIcon('heroicon-m-arrow-path')
                ->color('info')
                ->chart([3, 5, 4, 6, $activeTrips])
                ->extraAttributes([
                    'class' => 'stat-card-modern',
                ]),

            Stat::make('En Attente', $pendingBookings)
                ->description('Réservations à confirmer')
                ->descriptionIcon('heroicon-m-clock')
                ->color('warning')
                ->extraAttributes([
                    'class' => 'stat-card-modern',
                ]),
        ];
    }
}
