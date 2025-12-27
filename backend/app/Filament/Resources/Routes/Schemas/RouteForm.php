<?php

namespace App\Filament\Resources\Routes\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class RouteForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                \Filament\Schemas\Components\Section::make('Détails du Trajet')
                    ->schema([
                        \Filament\Schemas\Components\Grid::make(2)
                            ->schema([
                                \Filament\Forms\Components\Select::make('departure_port_id')
                                    ->label('Gare de Départ')
                                    ->relationship('departurePort', 'name')
                                    ->required()
                                    ->searchable()
                                    ->preload(),
                                \Filament\Forms\Components\Select::make('arrival_port_id')
                                    ->label('Gare d\'Arrivée')
                                    ->relationship('arrivalPort', 'name')
                                    ->required()
                                    ->searchable()
                                    ->preload(),
                            ]),
                        \Filament\Schemas\Components\Grid::make(2)
                            ->schema([
                                TextInput::make('duration_minutes')
                                    ->label('Durée Estimée')
                                    ->required()
                                    ->numeric()
                                    ->suffix(' minutes')
                                    ->helperText('Exemple: 120 pour 2 heures'),
                                Toggle::make('is_active')
                                    ->label('Ligne Active')
                                    ->default(true)
                                    ->required(),
                            ]),
                    ]),
            ]);
    }
}
