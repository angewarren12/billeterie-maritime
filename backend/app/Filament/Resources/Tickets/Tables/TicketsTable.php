<?php

namespace App\Filament\Resources\Tickets\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class TicketsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('booking.booking_reference')
                    ->label('Réservation')
                    ->searchable()
                    ->sortable()
                    ->fontFamily('mono'),
                TextColumn::make('passenger_name')
                    ->label('Nom du Passager')
                    ->searchable(),
                TextColumn::make('passenger_type')
                    ->label('Catégorie')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match($state) {
                        'adult' => 'Adulte',
                        'child' => 'Enfant',
                        'senior' => 'Sénior',
                        default => $state
                    }),
                TextColumn::make('nationality_group')
                    ->label('Nationalité')
                    ->badge()
                    ->color('info')
                    ->formatStateUsing(fn ($state) => match($state) {
                        'national' => 'National',
                        'resident' => 'Résident',
                        'african' => 'Africain',
                        default => $state
                    }),
                \Filament\Tables\Columns\TextColumn::make('status')
                    ->label('Statut')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'issued' => 'warning',
                        'used' => 'success',
                        'cancelled' => 'danger',
                        'refunded' => 'info',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn ($state) => match($state) {
                        'issued' => 'Émis',
                        'used' => 'Validé',
                        'cancelled' => 'Annulé',
                        'refunded' => 'Remboursé',
                        default => $state
                    }),
                TextColumn::make('trip.departure_time')
                    ->label('Départ Voyage')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
                TextColumn::make('price_paid')
                    ->label('Prix Payé')
                    ->money('XOF')
                    ->sortable(),
            ])
            ->filters([
                //
            ])
            ->actions([
                EditAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
