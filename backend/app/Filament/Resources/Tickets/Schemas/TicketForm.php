<?php

namespace App\Filament\Resources\Tickets\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class TicketForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                \Filament\Schemas\Components\Section::make('Détails du Ticket')
                    ->schema([
                        \Filament\Schemas\Components\Grid::make(2)
                            ->schema([
                                \Filament\Forms\Components\Select::make('booking_id')
                                    ->label('Réservation Parent')
                                    ->relationship('booking', 'booking_reference')
                                    ->required()
                                    ->searchable(),
                                \Filament\Forms\Components\Select::make('trip_id')
                                    ->label('Voyage / Traversée')
                                    ->relationship('trip', 'id') // On pourrait formater le titre du voyage
                                    ->getOptionLabelFromRecordUsing(fn ($record) => "{$record->route->departurePort->code} ➔ {$record->route->arrivalPort->code} ({$record->departure_time->format('d/m/Y H:i')})")
                                    ->required()
                                    ->searchable(),
                            ]),
                        \Filament\Schemas\Components\Grid::make(3)
                            ->schema([
                                TextInput::make('passenger_name')
                                    ->label('Nom du Passager')
                                    ->required(),
                                \Filament\Forms\Components\Select::make('passenger_type')
                                    ->label('Catégorie')
                                    ->options([
                                        'adult' => 'Adulte',
                                        'child' => 'Enfant',
                                        'senior' => 'Sénior',
                                    ])
                                    ->required(),
                                \Filament\Forms\Components\Select::make('nationality_group')
                                    ->label('Nationalité')
                                    ->options([
                                        'national' => 'National',
                                        'resident' => 'Résident',
                                        'african' => 'Africain',
                                    ])
                                    ->required(),
                            ]),
                    ]),
                \Filament\Schemas\Components\Section::make('Validité et Prix')
                    ->schema([
                        \Filament\Schemas\Components\Grid::make(3)
                            ->schema([
                                TextInput::make('price_paid')
                                    ->label('Prix Payé')
                                    ->numeric()
                                    ->prefix('FCFA')
                                    ->required(),
                                \Filament\Forms\Components\Select::make('status')
                                    ->label('Statut')
                                    ->options([
                                        'issued' => 'Émis',
                                        'used' => 'Validé',
                                        'cancelled' => 'Annulé',
                                    ])
                                    ->default('issued')
                                    ->required(),
                                DateTimePicker::make('used_at')
                                    ->label('Utilisé le')
                                    ->disabled() // Généralement mis à jour par le système
                                    ->placeholder('Non encore validé'),
                            ]),
                    ]),
            ]);
    }
}
