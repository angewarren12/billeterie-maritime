<?php

namespace App\Filament\Resources\Trips\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class TripsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('departure_time')
                    ->label('Départ')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
                TextColumn::make('route')
                    ->label('Trajet')
                    ->formatStateUsing(fn ($record) => "{$record->route->departurePort->code} ➔ {$record->route->arrivalPort->code}")
                    ->searchable(),
                TextColumn::make('ship.name')
                    ->label('Navire')
                    ->searchable()
                    ->sortable(),
                \Filament\Tables\Columns\TextColumn::make('status')
                    ->label('Statut')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'scheduled' => 'warning',
                        'boarding' => 'info',
                        'departed' => 'success',
                        'arrived' => 'success',
                        'cancelled' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn ($state) => match($state) {
                        'scheduled' => 'Planifié',
                        'boarding' => 'Embarquement',
                        'departed' => 'En Mer',
                        'arrived' => 'Arrivé',
                        'cancelled' => 'Annulé',
                        default => $state
                    }),
                TextColumn::make('available_seats_pax')
                    ->label('Places Pax')
                    ->numeric()
                    ->sortable()
                    ->description(fn ($record) => "sur " . $record->ship->capacity_pax),
                TextColumn::make('available_slots_vehicles')
                    ->label('Véhicules')
                    ->numeric()
                    ->sortable(),
            ])
            ->filters([
                \Filament\Tables\Filters\SelectFilter::make('port')
                    ->label('Gare de Départ')
                    ->relationship('route.departurePort', 'name'),
            ])
            ->actions([
                EditAction::make(),
                \Filament\Tables\Actions\Action::make('manifest')
                    ->label('Manifeste')
                    ->icon('heroicon-o-document-text')
                    ->color('info')
                    ->action(function ($record) {
                        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.manifest', [
                            'trip' => $record->load(['tickets.booking', 'route.departurePort', 'route.arrivalPort', 'ship']),
                        ]);
                        
                        return response()->streamDownload(function () use ($pdf) {
                            echo $pdf->stream();
                        }, "manifeste_{$record->id}.pdf");
                    }),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
