<?php

namespace App\Filament\Resources\AccessDevices\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class AccessDeviceForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                \Filament\Schemas\Components\Section::make('Configuration du Terminal d\'Accès')
                    ->description('Associez un appareil à une gare maritime pour le contrôle d\'accès.')
                    ->schema([
                        \Filament\Schemas\Components\Grid::make(2)
                            ->schema([
                                TextInput::make('name')
                                    ->label('Nom de l\'appareil')
                                    ->placeholder('ex: Tourniquet Entrée 1')
                                    ->required(),
                                \Filament\Forms\Components\Select::make('port_id')
                                    ->label('Gare / Port Associé')
                                    ->relationship('port', 'name')
                                    ->searchable()
                                    ->preload()
                                    ->required(),
                            ]),
                        \Filament\Schemas\Components\Grid::make(3)
                            ->schema([
                                \Filament\Forms\Components\Select::make('type')
                                    ->label('Type de Matériel')
                                    ->options([
                                        'tripod' => 'Tourniquet Tripode',
                                        'pda' => 'PDA / Portable',
                                        'handheld' => 'Scanner Manuel',
                                    ])
                                    ->required(),
                                TextInput::make('location')
                                    ->label('Emplacement Précis')
                                    ->placeholder('ex: Ponton A'),
                                TextInput::make('device_identifier')
                                    ->label('Identifiant Unique (IMEI/SN)')
                                    ->unique(ignoreRecord: true)
                                    ->required(),
                            ]),
                    ]),
            ]);
    }
}
