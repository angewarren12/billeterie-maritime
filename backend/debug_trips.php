<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Trip;
use Carbon\Carbon;

echo "DATE SYSTEME: " . now() . "\n";
echo "DATE AUJOURD'HUI: " . Carbon::today()->toDateString() . "\n";

$trips = Trip::whereDate('departure_time', Carbon::today())->get();

echo "NOMBRE DE VOYAGES AUJOURD'HUI: " . $trips->count() . "\n";

foreach ($trips as $t) {
    echo "ID: " . $t->id . "\n";
    echo "   Route: " . $t->route_id . "\n";
    echo "   Depart: " . $t->departure_time . "\n";
    echo "   Port Depart (via Route): " . ($t->route ? $t->route->departure_port_id : 'NULL') . "\n";
    echo "   Status: " . $t->status . "\n";
    echo "--------------------------------\n";
}
