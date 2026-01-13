<?php
$start = microtime(true);
try {
    $pdo = new PDO("mysql:host=127.0.0.1;port=3306;dbname=billeterie-maritine", "root", "");
    $time = round((microtime(true) - $start) * 1000);
    echo "✅ Connexion DB réussie en {$time}ms\n";
} catch (Exception $e) {
    echo "❌ Erreur : " . $e->getMessage() . "\n";
}
