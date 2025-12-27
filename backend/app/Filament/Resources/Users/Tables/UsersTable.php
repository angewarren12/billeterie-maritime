<?php

namespace App\Filament\Resources\Users\Tables;

use App\Filament\Traits\HasCommonTableActions;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class UsersTable
{
    use HasCommonTableActions;

    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                \Filament\Tables\Columns\ImageColumn::make('photo_url')
                    ->label('Photo')
                    ->circular()
                    ->defaultImageUrl(fn ($record) => 'https://ui-avatars.com/api/?name=' . urlencode($record->name)),
                TextColumn::make('name')
                    ->label('Nom Complet')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('email')
                    ->label('Email')
                    ->searchable(),
                TextColumn::make('role')
                    ->label('Rôle')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'admin' => 'danger',
                        'agent' => 'warning',
                        'client' => 'info',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn ($state) => match($state) {
                        'admin' => 'Administrateur',
                        'agent' => 'Agent Embarquement',
                        'guichetier' => 'Agent Guichet',
                        'client' => 'Client',
                        default => $state
                    }),
                TextColumn::make('created_at')
                    ->label('Inscrit le')
                    ->dateTime('d/m/Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions(static::getStandardActions())
            ->bulkActions(static::getCommonBulkActions());
    }
}
