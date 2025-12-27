<?php

namespace App\Filament\Resources\Ships\Pages;

use App\Filament\Resources\Ships\ShipResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditShip extends EditRecord
{
    protected static string $resource = ShipResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
