<?php

namespace App\Filament\Traits;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;

trait HasCommonTableActions
{
    /**
     * Get standard edit action for tables
     */
    public static function getEditAction(): EditAction
    {
        return EditAction::make();
    }

    /**
     * Get standard bulk actions for tables
     */
    public static function getCommonBulkActions(): array
    {
        return [
            BulkActionGroup::make([
                DeleteBulkAction::make(),
            ]),
        ];
    }

    /**
     * Get standard actions array for tables
     */
    public static function getStandardActions(): array
    {
        return [
            static::getEditAction(),
        ];
    }
}
