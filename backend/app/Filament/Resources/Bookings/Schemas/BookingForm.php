<?php

namespace App\Filament\Resources\Bookings\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class BookingForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                \Filament\Schemas\Components\Section::make('Informations de Réservation')
                    ->schema([
                        \Filament\Schemas\Components\Grid::make(2)
                            ->schema([
                                \Filament\Forms\Components\Select::make('user_id')
                                    ->label('Client')
                                    ->relationship('user', 'name')
                                    ->required()
                                    ->searchable()
                                    ->preload(),
                                TextInput::make('booking_reference')
                                    ->label('Référence')
                                    ->required()
                                    ->unique(ignoreRecord: true)
                                    ->default(fn () => 'RESERV-' . strtoupper(\Illuminate\Support\Str::random(8))),
                            ]),
                        \Filament\Schemas\Components\Grid::make(2)
                            ->schema([
                                TextInput::make('total_amount')
                                    ->label('Montant Total')
                                    ->required()
                                    ->numeric()
                                    ->prefix('FCFA')
                                    ->minValue(0),
                                \Filament\Forms\Components\Select::make('status')
                                    ->label('Statut du Dossier')
                                    ->required()
                                    ->options([
                                        'pending' => 'En attente',
                                        'confirmed' => 'Confirmé',
                                        'cancelled' => 'Annulé',
                                    ])
                                    ->default('pending')
                                    ->selectablePlaceholder(false),
                            ]),
                    ]),
            ]);
    }
}
