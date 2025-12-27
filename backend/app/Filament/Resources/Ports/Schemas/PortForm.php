<?php

namespace App\Filament\Resources\Ports\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class PortForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                \Filament\Schemas\Components\Section::make('Informations de la Gare')
                    ->description('Détails de base sur le port ou la gare maritime.')
                    ->schema([
                        \Filament\Schemas\Components\Grid::make(2)
                            ->schema([
                                TextInput::make('name')
                                    ->label('Nom de la Gare')
                                    ->required()
                                    ->maxLength(255),
                                TextInput::make('code')
                                    ->label('Code (3 lettres)')
                                    ->required()
                                    ->maxLength(3)
                                    ->unique(ignoreRecord: true),
                            ]),
                        \Filament\Schemas\Components\Grid::make(2)
                            ->schema([
                                TextInput::make('city')
                                    ->label('Ville')
                                    ->required(),
                                TextInput::make('country')
                                    ->label('Pays')
                                    ->required(),
                            ]),
                    ]),
            ]);
    }
}
