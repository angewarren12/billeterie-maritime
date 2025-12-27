<?php

namespace App\Filament\Resources\Trips\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Wizard;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Grid;
use Filament\Forms\Set;
use App\Models\Ship;
use Filament\Schemas\Schema;

class TripForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Wizard::make([
                    Wizard\Step::make('Informations de Base')
                        ->icon('heroicon-o-information-circle')
                        ->schema([
                            Grid::make(2)
                                ->schema([
                                    Select::make('route_id')
                                        ->label('Trajet')
                                        ->relationship('route', 'id')
                                        ->getOptionLabelFromRecordUsing(fn ($record) => "{$record->departurePort->name} ➔ {$record->arrivalPort->name}")
                                        ->searchable()
                                        ->preload()
                                        ->required(),
                                    Select::make('ship_id')
                                        ->label('Navire')
                                        ->relationship('ship', 'name')
                                        ->searchable()
                                        ->preload()
                                        ->required()
                                        ->live()
                                        ->afterStateUpdated(function ($state, Set $set) {
                                            if ($state) {
                                                $ship = Ship::find($state);
                                                if ($ship) {
                                                    $set('available_seats_pax', $ship->capacity_pax);
                                                    $set('available_slots_vehicles', $ship->capacity_vehicles);
                                                }
                                            }
                                        }),
                                    Select::make('status')
                                        ->label('Statut Inicial')
                                        ->options([
                                            'scheduled' => 'Planifié',
                                            'boarding' => 'Embarquement',
                                            'departed' => 'Parti',
                                            'arrived' => 'Arrivé',
                                            'cancelled' => 'Annulé',
                                            'delayed' => 'Retardé',
                                        ])
                                        ->required()
                                        ->default('scheduled')
                                        ->columnSpanFull(),
                                ]),
                        ]),

                    Wizard\Step::make('Horaires')
                        ->icon('heroicon-o-clock')
                        ->schema([
                            Grid::make(2)
                                ->schema([
                                    DateTimePicker::make('departure_time')
                                        ->label('Date & Heure de Départ')
                                        ->required()
                                        ->native(false)
                                        ->displayFormat('d/m/Y H:i'),
                                    DateTimePicker::make('arrival_time')
                                        ->label('Heure d\'Arrivée Estimée')
                                        ->native(false)
                                        ->displayFormat('d/m/Y H:i'),
                                ]),
                        ]),

                    Wizard\Step::make('Médias & Description')
                        ->icon('heroicon-o-photo')
                        ->schema([
                            FileUpload::make('images')
                                ->label('Galerie Photos')
                                ->multiple()
                                ->reorderable()
                                ->image()
                                ->directory('trips-photos')
                                ->columnSpanFull(),
                            RichEditor::make('description')
                                ->label('Description Détailée')
                                ->placeholder('Décrivez les spécificités de ce voyage...')
                                ->columnSpanFull(),
                        ]),

                    Wizard\Step::make('Quotas & Disponibilités')
                        ->icon('heroicon-o-users')
                        ->schema([
                            Grid::make(2)
                                ->schema([
                                    TextInput::make('available_seats_pax')
                                        ->label('Places Passagers')
                                        ->helperText('Initialisé via le navire, ajustable manuellement.')
                                        ->required()
                                        ->numeric(),
                                    TextInput::make('available_slots_vehicles')
                                        ->label('Places Véhicules')
                                        ->required()
                                        ->numeric()
                                        ->default(0),
                                ]),
                        ]),
                ])->columnSpanFull()
            ]);
    }
}
