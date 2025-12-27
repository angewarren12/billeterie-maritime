<?php

namespace App\Filament\Resources\PricingRules\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class PricingRuleForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                \Filament\Schemas\Components\Section::make('Configuration du Tarif')
                    ->schema([
                        \Filament\Schemas\Components\Grid::make(2)
                            ->schema([
                                \Filament\Forms\Components\Select::make('route_id')
                                    ->label('Trajet / Liaison')
                                    ->relationship('route', 'id')
                                    ->getOptionLabelFromRecordUsing(fn ($record) => "{$record->departurePort->name} ➔ {$record->arrivalPort->name}")
                                    ->searchable()
                                    ->preload()
                                    ->required(),
                                Toggle::make('is_active')
                                    ->label('Règle Active')
                                    ->onColor('success')
                                    ->default(true)
                                    ->required(),
                            ]),
                        \Filament\Schemas\Components\Grid::make(2)
                            ->schema([
                                \Filament\Forms\Components\Select::make('passenger_type')
                                    ->label('Type de Passager')
                                    ->options(\App\Models\PricingRule::getPassengerTypes())
                                    ->required(),
                                \Filament\Forms\Components\Select::make('nationality_group')
                                    ->label('Groupe de Nationalité')
                                    ->options(\App\Models\PricingRule::getNationalityGroups())
                                    ->required(),
                            ]),
                    ]),

                \Filament\Schemas\Components\Section::make('Montants')
                    ->schema([
                        \Filament\Schemas\Components\Grid::make(2)
                            ->schema([
                                TextInput::make('base_price')
                                    ->label('Prix de Base')
                                    ->required()
                                    ->numeric()
                                    ->prefix('FCFA'),
                                TextInput::make('tax_amount')
                                    ->label('Taxes / Redevances')
                                    ->required()
                                    ->numeric()
                                    ->default(0)
                                    ->prefix('FCFA'),
                            ]),
                    ]),
            ]);
    }
}
