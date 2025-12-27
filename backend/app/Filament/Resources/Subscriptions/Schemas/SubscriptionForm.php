<?php

namespace App\Filament\Resources\Subscriptions\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class SubscriptionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                \Filament\Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name')
                    ->searchable()
                    ->required(),
                \Filament\Forms\Components\Select::make('plan_id')
                    ->relationship('plan', 'name')
                    ->searchable()
                    ->required(),
                TextInput::make('rfid_card_id')
                    ->label('Numéro de Carte RFID')
                    ->placeholder('Ex: RFID-12345'),
                DatePicker::make('start_date')
                    ->required()
                    ->default(now()),
                DatePicker::make('end_date')
                    ->required(),
                \Filament\Forms\Components\Select::make('status')
                    ->options([
                        'active' => 'Actif',
                        'expired' => 'Expiré',
                        'blocked' => 'Bloqué',
                    ])
                    ->required()
                    ->default('active'),
                TextInput::make('current_credit')
                    ->label('Solde (optionnel)')
                    ->numeric()
                    ->default(0.0),
            ]);
    }
}
