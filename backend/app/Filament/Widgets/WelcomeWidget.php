<?php

namespace App\Filament\Widgets;

use Filament\Widgets\Widget;
use Illuminate\Support\Facades\Auth;

class WelcomeWidget extends Widget
{
    protected string $view = 'filament.widgets.welcome-widget';
    
    protected static ?int $sort = 2;
    
    protected int | string | array $columnSpan = 'full';

    public function getGreeting(): string
    {
        $hour = now()->hour;
        
        if ($hour < 12) {
            return 'Bonjour';
        } elseif ($hour < 18) {
            return 'Bon après-midi';
        } else {
            return 'Bonsoir';
        }
    }

    public function getUserName(): string
    {
        return Auth::user()->name ?? 'Administrateur';
    }
}
