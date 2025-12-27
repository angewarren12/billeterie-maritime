<?php

namespace App\Filament\Widgets;

use Filament\Tables\Table;
use Filament\Widgets\TableWidget;
use App\Models\Booking;
use App\Filament\Resources\Bookings\BookingResource;

class LatestBookings extends TableWidget
{
    protected static ?string $heading = 'Dernières Réservations';

    protected int|string|array $columnSpan = 'full';

    protected static ?int $sort = 5;

    public function table(Table $table): Table
    {
        return $table
            ->query(Booking::query()->with(['user'])->latest()->limit(5))
            ->columns([
                \Filament\Tables\Columns\TextColumn::make('booking_reference')
                    ->label('Référence')
                    ->searchable()
                    ->fontFamily('mono')
                    ->copyable(),
                \Filament\Tables\Columns\TextColumn::make('user.name')
                    ->label('Client')
                    ->searchable(),
                \Filament\Tables\Columns\TextColumn::make('total_amount')
                    ->label('Montant')
                    ->badge()
                    ->color('success')
                    ->formatStateUsing(fn ($state) => number_format($state, 0, ',', ' ') . ' FCFA')
                    ->sortable(),
                \Filament\Tables\Columns\TextColumn::make('status')
                    ->label('État')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'confirmed' => 'success',
                        'cancelled' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn ($state) => match($state) {
                        'pending' => 'En attente',
                        'confirmed' => 'Confirmé',
                        'cancelled' => 'Annulé',
                        default => $state
                    }),
                \Filament\Tables\Columns\TextColumn::make('created_at')
                    ->label('Fait le')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->actions([
                \Filament\Actions\Action::make('view')
                    ->label('Voir')
                    ->url(fn ($record) => BookingResource::getUrl('edit', ['record' => $record]))
                    ->icon('heroicon-m-eye')
                    ->color('gray'),
            ]);
    }
}
