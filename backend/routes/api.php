<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\RouteController;
use App\Http\Controllers\Api\ScanController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\TripController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health Check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'service' => 'Maritime Billetterie API',
        'version' => '1.0.0'
    ]);
});

// Route publique pour consultation ticket
Route::get('/public/booking/{reference}', [BookingController::class, 'showPublic']);

// =============================
// ROUTES PUBLIQUES (Sans auth)
// =============================

// Authentification
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, '

register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Routes maritimes
Route::prefix('routes')->group(function () {
    Route::get('/', [RouteController::class, 'index']);
    Route::get('/{route}', [RouteController::class, 'show']);
});

// Trips (Traversées)
Route::prefix('trips')->group(function () {
    Route::get('/', [TripController::class, 'search']);
    Route::get('/{trip}', [TripController::class, 'show']);
});

// Calcul de prix
Route::post('/pricing', [TripController::class, 'pricing']);

// QR Code Validation (public pour les agents avec appareils non authentifiés)
Route::prefix('scan')->group(function () {
    Route::post('/validate', [ScanController::class, 'validate']);
    Route::get('/statistics', [ScanController::class, 'statistics']);
    Route::post('/sync', [ScanController::class, 'sync']);
    Route::get('/trip/{trip}/passengers', [ScanController::class, 'tripPassengers']);
});

// =============================
// ROUTES PROTÉGÉES (Auth required)
// =============================

Route::middleware('auth:sanctum')->group(function () {
    
    // Authentification protégée
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
    
    // Gestion du profil
    Route::prefix('user')->group(function () {
        Route::put('/profile', [AuthController::class, 'updateProfile']);
    });
    
    // Réservations
    Route::prefix('bookings')->group(function () {
        Route::get('/', [BookingController::class, 'index']);
        // Route::post('/', [BookingController::class, 'store']); // Déplacé en public pour les invités
    });

    // Abonnements
    Route::prefix('subscriptions')->group(function () {
        Route::get('/active', [SubscriptionController::class, 'active']);
        Route::get('/', [SubscriptionController::class, 'index']);
    });
});

// Réservations publiques (Guests & Confirmation)
Route::post('/bookings', [BookingController::class, 'store']);
Route::get('/bookings/{booking}', [BookingController::class, 'show']);
Route::get('/bookings/{booking}/pdf', [BookingController::class, 'downloadPdf']);

// Badges & Abonnements
Route::get('/badges/plans', [App\Http\Controllers\Api\BadgeController::class, 'index']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/badges/my-subscription', [App\Http\Controllers\Api\BadgeController::class, 'mySubscription']);
    Route::post('/badges/subscribe', [App\Http\Controllers\Api\BadgeController::class, 'subscribe']);
});
