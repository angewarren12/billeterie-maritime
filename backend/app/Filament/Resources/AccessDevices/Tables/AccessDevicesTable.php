<?php

namespace App\Filament\Resources\AccessDevices\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class AccessDevicesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label('Nom de l\'Appareil')
                    ->searchable()
                    ->sortable()
                    ->icon('heroicon-m-cpu-chip'),
                TextColumn::make('port.name')
                    ->label('Gare / Port')
                    ->searchable()
                    ->sortable(),
                \Filament\Tables\Columns\TextColumn::make('type')
                    ->label('Type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'tripod' => 'info',
                        'handheld' => 'warning',
                        'pda' => 'success',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn ($state) => match($state) {
                        'tripod' => 'Tourniquet',
                        'handheld' => 'Scanner Manuel',
                        'pda' => 'PDA Mobile',
                        default => $state
                    }),
                TextColumn::make('device_identifier')
                    ->label('ID Matériel')
                    ->fontFamily('mono')
                    ->searchable(),
                TextColumn::make('created_at')
                    ->label('Enregistré le')
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
