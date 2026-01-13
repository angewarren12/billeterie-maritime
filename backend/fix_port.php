<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\CashDesk;

$cd = CashDesk::find(1);
if ($cd) {
    echo "Old Port ID: " . $cd->port_id . "\n";
    $cd->port_id = 7; // Set to Dakar
    $cd->save();
    echo "New Port ID: " . $cd->port_id . "\n";
    echo "Fixed Cash Desk Port assignment.\n";
} else {
    echo "Cash Desk 1 not found.\n";
}
