<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Trip;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\Admin\TripController;

// Mock Request
$request = Request::create('/api/admin/trips', 'GET', [
    'departure_port_id' => 7,
    'status' => 'scheduled,boarding'
]);

$controller = new TripController();
$response = $controller->index($request);

echo "Status Code: " . $response->getStatusCode() . "\n";
$content = $response->getContent();
$data = json_decode($content, true);

echo "Data Type: " . gettype($data) . "\n";
if (isset($data['data'])) {
    echo "Data Count: " . count($data['data']) . "\n";
    if (count($data['data']) > 0) {
        $first = $data['data'][0];
        echo "First Trip ID: " . $first['id'] . "\n";
        echo "Departure: " . $first['departure_time'] . "\n";
    }
} else {
    echo "No 'data' key found.\n";
    print_r(array_keys($data));
}
