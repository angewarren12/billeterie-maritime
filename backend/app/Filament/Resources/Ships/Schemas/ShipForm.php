<?php

namespace App\Filament\Resources\Ships\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class ShipForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                \Filament\Schemas\Components\Section::make('Détails du Navire')
                    ->schema([
                        \Filament\Schemas\Components\Grid::make(2)
                            ->schema([
                                TextInput::make('name')
                                    ->label('Nom du Navire')
                                    ->required()
                                    ->maxLength(255),
                                TextInput::make('company')
                                    ->label('Compagnie / Armateur'),
                            ]),
                        \Filament\Schemas\Components\Grid::make(3)
                            ->schema([
                                TextInput::make('type')
                                    ->label('Type de Navire')
                                    ->required()
                                    ->default('ferry'),
                                Toggle::make('is_active')
                                    ->label('En Service')
                                    ->onColor('success')
                                    ->required(),
                            ]),
                    ]),

                \Filament\Schemas\Components\Section::make('Capacités de Transport')
                    ->description('Définissez les limites de passagers et de fret.')
                    ->schema([
                        \Filament\Schemas\Components\Grid::make(3)
                            ->schema([
                                TextInput::make('capacity_pax')
                                    ->label('Capacité Passagers')
                                    ->required()
                                    ->numeric()
                                    ->minValue(0),
                                TextInput::make('capacity_vehicles')
                                    ->label('Capacité Véhicules')
                                    ->required()
                                    ->numeric()
                                    ->default(0),
                                TextInput::make('capacity_freight')
                                    ->label('Capacité Fret (Tonnes)')
                                    ->required()
                                    ->numeric()
                                    ->default(0),
                            ]),
                    ]),
            ]);
    }
}
