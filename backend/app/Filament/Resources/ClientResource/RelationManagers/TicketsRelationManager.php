<?php

namespace App\Filament\Resources\ClientResource\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Resources\Pages\Page;
use App\Models\Ticket;

class TicketsRelationManager extends RelationManager
{
    protected static string $relationship = 'tickets';

    protected static ?string $recordTitleAttribute = 'ticket_number';

    protected static ?string $title = 'Billets';

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('ticket_number')
                    ->label('N° Billet')
                    ->fontFamily('mono')
                    ->searchable()
                    ->sortable()
                    ->copyable(),
                TextColumn::make('trip.route')
                    ->label('Trajet')
                    ->formatStateUsing(fn ($record) => $record->trip && $record->trip->route ? "{$record->trip->route->departurePort->code} ➔ {$record->trip->route->arrivalPort->code}" : '-'),
                TextColumn::make('passenger_name')
                    ->label('Passager')
                    ->searchable(),
                TextColumn::make('status')
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
                TextColumn::make('price_paid')
                    ->label('Prix')
                    ->money('XOF')
                    ->sortable(),
            ]);
    }
}
