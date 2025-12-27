<?php

namespace App\Filament\Widgets;

use App\Models\Booking;
use Filament\Widgets\ChartWidget;
use Flowframe\Trend\Trend;
use Flowframe\Trend\TrendValue;

class BookingsChartWidget extends ChartWidget
{
    protected ?string $heading = 'Réservations (7 derniers jours)';
    
    protected static ?int $sort = 3;

    protected int | string | array $columnSpan = [
        'default' => 'full',
        'md' => 1,
        'lg' => 1,
    ];

    protected function getData(): array
    {
        $data = Trend::model(Booking::class)
            ->between(
                start: now()->subDays(7),
                end: now(),
            )
            ->perDay()
            ->count();

        return [
            'datasets' => [
                [
                    'label' => 'Réservations',
                    'data' => $data->map(fn (TrendValue $value) => $value->aggregate),
                    'backgroundColor' => 'rgba(14, 165, 233, 0.1)',
                    'borderColor' => 'rgb(14, 165, 233)',
                    'fill' => true,
                ],
            ],
            'labels' => $data->map(fn (TrendValue $value) => 
                \Carbon\Carbon::parse($value->date)->format('d/m')
            ),
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
