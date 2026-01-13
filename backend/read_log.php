<?php
$logFile = __DIR__ . '/storage/logs/laravel.log';
if (!file_exists($logFile)) {
    echo "Log file not found.";
    exit;
}

$content = file_get_contents($logFile);
// Get last 2000 chars
echo substr($content, -3000);
