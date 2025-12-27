<?php

namespace App\Filament\Widgets;

use App\Models\Trip;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class UpcomingTripsWidget extends BaseWidget
{
    protected static ?int $sort = 4;
    
    protected int | string | array $columnSpan = [
        'md' => 2,
        'xl' => 2,
    ];

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Trip::query()
                    ->with(['route.departurePort', 'route.arrivalPort', 'ship'])
                    ->where('departure_time', '>=', now())
                    ->where('status', 'scheduled')
                    ->orderBy('departure_time')
                    ->limit(10)
            )
            ->columns([
                Tables\Columns\TextColumn::make('departure_time')
                    ->label('Départ')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
                Tables\Columns\TextColumn::make('route')
                    ->label('Trajet')
                    ->formatStateUsing(fn ($record) => 
                        "{$record->route->departurePort->name} → {$record->route->arrivalPort->name}"
                    ),
                Tables\Columns\TextColumn::make('ship.name')
                    ->label('Navire')
                    ->badge()
                    ->color('info'),
                Tables\Columns\TextColumn::make('available_seats_pax')
                    ->label('Places Disponibles')
                    ->badge()
                    ->color(fn ($state, $record) => 
                        $state < ($record->ship->capacity_pax * 0.2) ? 'danger' : 
                        ($state < ($record->ship->capacity_pax * 0.5) ? 'warning' : 'success')
                    ),
                Tables\Columns\TextColumn::make('occupancy')
                    ->label('Taux Remplissage')
                    ->formatStateUsing(function ($record) {
                        $occupancy = (($record->ship->capacity_pax - $record->available_seats_pax) / $record->ship->capacity_pax) * 100;
                        return round($occupancy) . '%';
                    })
                    ->badge()
                    ->color(function ($record) {
                        $occupancy = (($record->ship->capacity_pax - $record->available_seats_pax) / $record->ship->capacity_pax) * 100;
                        return $occupancy >= 80 ? 'success' : ($occupancy >= 50 ? 'warning' : 'gray');
                    }),
                Tables\Columns\TextColumn::make('status')
                    ->label('Statut')
                    ->badge()
                    ->color('success'),
            ])
            ->heading('Prochaines Traversées')
            ->description('Les 10 prochains départs programmés');
    }
}
