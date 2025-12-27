<?php

namespace App\Filament\Resources\Ships\Pages;

use App\Filament\Resources\Ships\ShipResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListShips extends ListRecords
{
    protected static string $resource = ShipResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
