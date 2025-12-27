<?php
namespace App\Filament\Resources\PricingRules\Tables;

use App\Filament\Traits\HasCommonTableActions;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class PricingRulesTable
{
    use HasCommonTableActions;

    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('route')
                    ->label('Trajet')
                    ->formatStateUsing(fn ($record) => "{$record->route->departurePort->name} ➔ {$record->route->arrivalPort->name}")
                    ->searchable()
                    ->sortable(),
                TextColumn::make('passenger_type')
                    ->label('Catégorie')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match($state) {
                        'adult' => 'Adulte',
                        'child' => 'Enfant',
                        'senior' => 'Sénior',
                        default => $state
                    }),
                TextColumn::make('nationality_group')
                    ->label('Nationalité')
                    ->badge()
                    ->color('info')
                    ->formatStateUsing(fn ($state) => match($state) {
                        'national' => 'National',
                        'resident' => 'Résident',
                        'african' => 'Africain',
                        'hors_afrique' => 'Hors Afrique',
                        default => $state
                    }),
                TextColumn::make('base_price')
                    ->label('Prix de Base')
                    ->money('XOF')
                    ->sortable(),
                IconColumn::make('is_active')
                    ->label('Actif')
                    ->boolean(),
            ])
            ->filters([
                \Filament\Tables\Filters\SelectFilter::make('route_id')
                    ->label('Trajet')
                    ->relationship('route', 'id')
                    ->getOptionLabelFromRecordUsing(fn ($record) => "{$record->departurePort->name} ➔ {$record->arrivalPort->name}")
                    ->searchable()
                    ->preload(),
                \Filament\Tables\Filters\SelectFilter::make('passenger_type')
                    ->label('Type de Passager')
                    ->options([
                        'adult' => 'Adulte',
                        'child' => 'Enfant',
                        'senior' => 'Sénior',
                    ]),
                \Filament\Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Statut')
                    ->placeholder('Toutes les règles')
                    ->trueLabel('Actives uniquement')
                    ->falseLabel('Inactives uniquement'),
            ])
            ->actions(static::getStandardActions())
            ->bulkActions(static::getCommonBulkActions());
    }
}
