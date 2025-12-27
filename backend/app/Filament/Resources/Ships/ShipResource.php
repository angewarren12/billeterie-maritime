<?php

namespace App\Filament\Resources\Ships;

use App\Filament\Resources\Ships\Pages\CreateShip;
use App\Filament\Resources\Ships\Pages\EditShip;
use App\Filament\Resources\Ships\Pages\ListShips;
use App\Filament\Resources\Ships\Schemas\ShipForm;
use App\Filament\Resources\Ships\Tables\ShipsTable;
use App\Models\Ship;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class ShipResource extends Resource
{
    protected static ?string $model = Ship::class;

    protected static ?string $navigationLabel = 'Flotte / Navires';
    protected static ?string $pluralLabel = 'Navires';
    protected static ?string $modelLabel = 'Navire';
    protected static \UnitEnum|string|null $navigationGroup = 'Infrastructure';

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-rocket-launch';

    public static function form(Schema $schema): Schema
    {
        return ShipForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ShipsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListShips::route('/'),
            'create' => CreateShip::route('/create'),
            'edit' => EditShip::route('/{record}/edit'),
        ];
    }
}
