<?php

namespace App\Filament\Widgets;

use App\Models\Booking;
use Filament\Widgets\ChartWidget;
use Flowframe\Trend\Trend;
use Flowframe\Trend\TrendValue;

class MonthlyRevenueChartWidget extends ChartWidget
{
    protected ?string $heading = 'Performance Commerciale (Mensuelle)';
    
    protected static ?int $sort = 4;

    protected int | string | array $columnSpan = [
        'default' => 'full',
        'md' => 1,
        'lg' => 1,
    ];

    protected function getData(): array
    {
        // Cache the result for 5 minutes (300 seconds) to prevent DB OOM errors
        return \Illuminate\Support\Facades\Cache::remember('monthly_revenue_chart', 300, function () {
            $data = Trend::model(Booking::class)
                ->between(
                    start: now()->subDays(30),
                    end: now(),
                )
                ->perDay()
                ->sum('total_amount');

            return [
                'datasets' => [
                    [
                        'label' => 'Recettes (FCFA)',
                        'data' => $data->map(fn (TrendValue $value) => $value->aggregate),
                        'backgroundColor' => 'rgba(34, 197, 94, 0.1)',
                        'borderColor' => 'rgb(34, 197, 94)',
                        'fill' => true,
                        'tension' => 0.4,
                    ],
                ],
                'labels' => $data->map(fn (TrendValue $value) => 
                    \Carbon\Carbon::parse($value->date)->format('d/m')
                ),
            ];
        });
    }

    protected function getType(): string
    {
        return 'line';
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => [
                'legend' => [
                    'display' => true,
                ],
            ],
            'scales' => [
                'y' => [
                    'beginAtZero' => true,
                ],
            ],
        ];
    }
}
