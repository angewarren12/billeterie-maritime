<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\CashDesk;
use App\Models\Port;

$email = 'caisse.dakar@maritime.sn';
$user = User::where('email', $email)->with('cashDesk')->first();

if ($user) {
    echo "User: " . $user->name . "\n";
    if ($user->cashDesk) {
        echo "Cash Desk: " . $user->cashDesk->name . " (ID: " . $user->cashDesk->id . ")\n";
        echo "Cash Desk Port ID: " . $user->cashDesk->port_id . "\n";
        $port = Port::find($user->cashDesk->port_id);
        echo "Port Name: " . ($port ? $port->name : 'Unknown') . "\n";
    } else {
        echo "NO CASH DESK ASSIGNED.\n";
    }
} else {
    echo "User not found.\n";
}

$dakar = Port::where('name', 'like', '%Dakar%')->first();
echo "Dakar Port ID: " . ($dakar ? $dakar->id : 'Not Found') . "\n";

$goree = Port::where('name', 'like', '%Gorée%')->first();
echo "Goree Port ID: " . ($goree ? $goree->id : 'Not Found') . "\n";
