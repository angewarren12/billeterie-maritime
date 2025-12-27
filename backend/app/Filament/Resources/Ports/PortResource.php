<?php

namespace App\Filament\Resources\Ports;

use App\Filament\Resources\Ports\Pages\CreatePort;
use App\Filament\Resources\Ports\Pages\EditPort;
use App\Filament\Resources\Ports\Pages\ListPorts;
use App\Filament\Resources\Ports\Schemas\PortForm;
use App\Filament\Resources\Ports\Tables\PortsTable;
use App\Models\Port;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class PortResource extends Resource
{
    protected static ?string $model = Port::class;

    protected static ?string $navigationLabel = 'Gares Maritimes';
    protected static ?string $pluralLabel = 'Gares Maritimes';
    protected static ?string $modelLabel = 'Gare';
    protected static \UnitEnum|string|null $navigationGroup = 'Infrastructure';

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-building-office-2';

    public static function form(Schema $schema): Schema
    {
        return PortForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PortsTable::configure($table);
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
            'index' => ListPorts::route('/'),
            'create' => CreatePort::route('/create'),
            'edit' => EditPort::route('/{record}/edit'),
        ];
    }
}
