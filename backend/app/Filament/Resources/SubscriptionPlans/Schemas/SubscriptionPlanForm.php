<?php

namespace App\Filament\Resources\SubscriptionPlans\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class SubscriptionPlanForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                TextInput::make('price')
                    ->required()
                    ->numeric()
                    ->suffix('FCFA'),
                \Filament\Forms\Components\Select::make('credit_type')
                    ->options([
                        'counted' => 'Nombre fixe de crédits',
                        'unlimited' => 'Illimité pendant la durée',
                    ])
                    ->required()
                    ->reactive()
                    ->default('counted')
                    ->label('Type de crédit'),
                TextInput::make('voyage_credits')
                    ->numeric()
                    ->default(0)
                    ->visible(fn ($get) => $get('credit_type') === 'counted')
                    ->label('Nombre de crédits voyage')
                    ->helperText('Combien de voyages sont inclus dans ce plan'),
                TextInput::make('duration_days')
                    ->required()
                    ->numeric()
                    ->label('Durée (jours)'),
                Toggle::make('is_active')
                    ->required()
                    ->default(true),
                \Filament\Forms\Components\Select::make('period')
                    ->options([
                        'ANNUEL' => 'Annuel',
                        'MENSUEL' => 'Mensuel',
                        'HEBDOMADAIRE' => 'Hebdomadaire',
                    ])
                    ->required()
                    ->default('ANNUEL'),
                \Filament\Forms\Components\Select::make('category')
                    ->options([
                        'GOREEN' => 'GOREEN',
                        'MARIAMA BA' => 'MARIAMA BA',
                        'PROFESSIONNEL' => 'PROFESSIONNEL',
                        '3EME AGE' => '3EME AGE',
                        'AUTRE' => 'AUTRE',
                    ])
                    ->required(),
            ]);
    }
}
