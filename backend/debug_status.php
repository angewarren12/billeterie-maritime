<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Trip;
use App\Models\PricingRule;
use Illuminate\Support\Facades\Schema;

$email = 'caisse.dakar@maritime.sn';
$user = User::where('email', $email)->first();

if ($user) {
    echo "USER: " . $user->name . "\n";
    echo "ROLES: " . implode(', ', $user->getRoleNames()->toArray()) . "\n";
    echo "PERMISSIONS: " . implode(', ', $user->getAllPermissions()->pluck('name')->toArray()) . "\n";
} else {
    echo "USER NOT FOUND: $email\n";
}

echo "TRIPS COUNT: " . Trip::count() . "\n";
echo "PRICING RULES FOR ROUTE 4: " . PricingRule::where('route_id', 4)->count() . "\n";
