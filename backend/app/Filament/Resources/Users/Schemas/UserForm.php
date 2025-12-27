<?php

namespace App\Filament\Resources\Users\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                \Filament\Schemas\Components\Section::make('Identité & Profil')
                    ->schema([
                        \Filament\Schemas\Components\Grid::make(2)
                            ->schema([
                                TextInput::make('name')
                                    ->label('Nom Complet')
                                    ->required()
                                    ->maxLength(255),
                                TextInput::make('email')
                                    ->label('Adresse Email')
                                    ->email()
                                    ->required()
                                    ->unique(ignoreRecord: true),
                            ]),
                        \Filament\Schemas\Components\Grid::make(2)
                            ->schema([
                                TextInput::make('phone')
                                    ->label('Téléphone')
                                    ->tel(),
                                \Filament\Forms\Components\Select::make('nationality')
                                    ->label('Nationalité')
                                    ->searchable()
                                    ->options([
                                        'SN' => 'Sénégalaise',
                                        'FR' => 'Française',
                                        'GM' => 'Gambienne',
                                        'ML' => 'Malienne',
                                        // Ajoutez plus si nécessaire
                                    ]),
                            ]),
                        \Filament\Forms\Components\FileUpload::make('photo_url')
                            ->label('Photo de Profil')
                            ->avatar()
                            ->imageEditor()
                            ->circleCropper()
                            ->directory('avatars'),
                    ]),

                \Filament\Schemas\Components\Section::make('Sécurité & Rôles')
                    ->schema([
                        \Filament\Schemas\Components\Grid::make(2)
                            ->schema([
                                // \Filament\Forms\Components\Select::make('role')
                                //     ->label('Rôle Legacy')
                                //     ->options([
                                //         'admin' => 'Administrateur',
                                //         'agent' => 'Agent Embarquement',
                                //         'guichetier' => 'Agent Guichet',
                                //         'client' => 'Client / Passager',
                                //     ])
                                //     ->required()
                                //     ->default('client'),
                                \Filament\Forms\Components\Select::make('roles')
                                    ->label('Rôles & Permissions')
                                    ->relationship('roles', 'name')
                                    ->multiple()
                                    ->preload()
                                    ->searchable(),
                                \Filament\Forms\Components\Select::make('type')
                                    ->label('Type de Client')
                                    ->options([
                                        'national' => 'National',
                                        'resident' => 'Résident',
                                        'non-resident' => 'Non-Résident',
                                    ])
                                    ->required()
                                    ->default('national'),
                            ]),
                        TextInput::make('password')
                            ->label('Mot de passe')
                            ->password()
                            ->dehydrated(fn ($state) => filled($state))
                            ->required(fn (string $context): bool => $context === 'create')
                            ->revealable(),
                    ]),
            ]);
    }
}
