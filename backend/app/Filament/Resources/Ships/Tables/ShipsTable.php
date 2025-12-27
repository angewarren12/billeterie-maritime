<?php

namespace App\Filament\Resources\Ships\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ShipsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label('Nom du Navire')
                    ->searchable()
                    ->sortable()
                    ->icon('heroicon-m-rocket-launch'),
                TextColumn::make('company')
                    ->label('Armateur')
                    ->searchable(),
                TextColumn::make('type')
                    ->label('Type')
                    ->badge()
                    ->color('info'),
                TextColumn::make('capacity_pax')
                    ->label('Capacité Pax')
                    ->numeric()
                    ->sortable(),
                IconColumn::make('is_active')
                    ->label('En Service')
                    ->boolean(),
                TextColumn::make('created_at')
                    ->label('Ajouté le')
                    ->dateTime('d/m/Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions([
                EditAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
