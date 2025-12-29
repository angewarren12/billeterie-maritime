<?php

namespace App\Filament\Resources\SubscriptionPlans\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class SubscriptionPlansTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable(),
                TextColumn::make('price')
                    ->money('XOF')
                    ->sortable(),
                \Filament\Tables\Columns\TextColumn::make('credit_type')
                    ->badge()
                    ->color(fn ($state) => $state === 'unlimited' ? 'success' : 'primary')
                    ->formatStateUsing(fn ($state) => $state === 'unlimited' ? 'ILLIMITÉ' : 'COMPTÉ'),
                \Filament\Tables\Columns\TextColumn::make('voyage_credits')
                    ->label('Crédits')
                    ->formatStateUsing(fn ($state, $record) => 
                        $record->credit_type === 'unlimited' ? '∞' : $state . ' voyages'
                    ),
                TextColumn::make('duration_days')
                    ->numeric()
                    ->sortable()
                    ->suffix(' jours'),
                IconColumn::make('is_active')
                    ->boolean(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('period')
                    ->searchable(),
                TextColumn::make('category')
                    ->searchable(),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
