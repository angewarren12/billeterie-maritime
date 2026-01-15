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

Route::get('/fast-ping', function () {
    return 'pong';
});

Route::get('/test', function () {
    return response()->json(['message' => 'API is working']);
});

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

// Hardware Device Scans (Fixed Turnstiles)
Route::post('/device/scan', [App\Http\Controllers\Api\DeviceScanController::class, 'scan']);

// Authentification
// Authentification - Rate limited
Route::middleware('throttle:10,1')->prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login'])->name('login');
});

// Routes maritimes
Route::prefix('routes')->group(function () {
    Route::get('/', [RouteController::class, 'index']);
    Route::get('/{route}', [RouteController::class, 'show']);
});

// Ports (Villes/Villes de départ) - Public
Route::get('/ports', [App\Http\Controllers\Api\PortController::class, 'index']);

// Trips (Traversées)
Route::prefix('trips')->group(function () {
    Route::get('/', [TripController::class, 'search']);
    Route::get('/{trip}', [TripController::class, 'show']);
});

// Calcul de prix
Route::post('/pricing', [TripController::class, 'pricing']);

// QR Code Validation (Protégé par Auth)
Route::middleware('auth:sanctum')->prefix('scan')->group(function () {
    Route::post('/validate', [ScanController::class, 'validate']);
    Route::get('/statistics', [ScanController::class, 'statistics']);
    Route::post('/sync', [ScanController::class, 'sync']);
    Route::get('/trip/{trip}/passengers', [ScanController::class, 'tripPassengers']);
    Route::post('/bypass', [ScanController::class, 'bypass'])->middleware('throttle:10,1');
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
        Route::post('/{booking}/cancel', [BookingController::class, 'cancel']);
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
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/badges/my-subscription', [App\Http\Controllers\Api\BadgeController::class, 'mySubscription']);
    Route::post('/badges/subscribe', [App\Http\Controllers\Api\BadgeController::class, 'subscribe']);
    Route::get('/badges/plans', [App\Http\Controllers\Api\BadgeController::class, 'plans']);
});

// =============================
// ADMIN API ROUTES
// =============================
// =============================
// ADMIN API ROUTES
// =============================
Route::prefix('admin')->middleware(['auth:sanctum'])->group(function () {

    // 1. GLOBAL MANAGEMENT (Super Admin, Admin, Manager)
    Route::middleware(['role:super_admin|admin|manager'])->group(function () {
        Route::get('dashboard/stats', [\App\Http\Controllers\Api\Admin\DashboardController::class, 'stats']);
        
        Route::apiResource('trips', \App\Http\Controllers\Api\Admin\TripController::class)->except(['index', 'show']);
        Route::post('trips/batch', [\App\Http\Controllers\Api\Admin\TripController::class, 'batchStore']);
        
        Route::apiResource('ports', \App\Http\Controllers\Api\PortController::class)->except(['index', 'show']);
        Route::apiResource('ships', \App\Http\Controllers\Api\Admin\ShipController::class);
        Route::apiResource('routes', \App\Http\Controllers\Api\Admin\RouteController::class);
        
        Route::apiResource('cash-desks', \App\Http\Controllers\Api\Admin\CashDeskController::class);
        Route::post('cash-desks/{cashDesk}/assign', [\App\Http\Controllers\Api\Admin\CashDeskController::class, 'assign']);
        Route::post('users/{user}/unassign-cash-desk', [\App\Http\Controllers\Api\Admin\CashDeskController::class, 'unassign']);
        
        Route::apiResource('subscription-plans', \App\Http\Controllers\Api\Admin\SubscriptionPlanController::class)->except(['index', 'show']);
        Route::apiResource('subscriptions', \App\Http\Controllers\Api\Admin\SubscriptionController::class)->except(['index', 'show']);
        Route::put('subscriptions/{subscription}/status', [\App\Http\Controllers\Api\Admin\SubscriptionController::class, 'updateStatus']);
        
        Route::apiResource('users', \App\Http\Controllers\Api\Admin\UserController::class)->only(['index', 'show', 'store']);
        
        Route::apiResource('bookings', \App\Http\Controllers\Api\Admin\BookingController::class)->except(['index', 'show']);
    });

    // 2. POS OPERATIONS (Super Admin, Admin, Manager, Guichetier)
    Route::middleware(['role:super_admin|admin|manager|guichetier'])->group(function () {
        Route::get('dashboard/cashier-stats', [\App\Http\Controllers\Api\Admin\DashboardController::class, 'cashierStats']);
        Route::post('pos/sale', [\App\Http\Controllers\Api\Admin\PosController::class, 'sale']);
        Route::get('pos/customers', [\App\Http\Controllers\Api\Admin\PosController::class, 'searchCustomer']);
        Route::post('pos/customers', [\App\Http\Controllers\Api\Admin\PosController::class, 'storeCustomer']);
        Route::post('pos/session/start', [\App\Http\Controllers\Api\Admin\PosController::class, 'startSession']);
        Route::post('pos/session/close', [\App\Http\Controllers\Api\Admin\PosController::class, 'closeSession']);
        Route::get('pos/session/status', [\App\Http\Controllers\Api\Admin\PosController::class, 'sessionStatus']);
        Route::post('pos/subscription/sale', [\App\Http\Controllers\Api\Admin\PosController::class, 'saleSubscription']);
        
        // Subscription Management for POS
        Route::post('subscriptions/{subscription}/associate-rfid', [\App\Http\Controllers\Api\Admin\SubscriptionController::class, 'associateRfid']);
        Route::post('subscriptions/{subscription}/deliver', [\App\Http\Controllers\Api\Admin\SubscriptionController::class, 'deliver']);
        Route::apiResource('subscriptions', \App\Http\Controllers\Api\Admin\SubscriptionController::class)->only(['index', 'show']);
        
        // Trips & Bookings for POS
        Route::apiResource('trips', \App\Http\Controllers\Api\Admin\TripController::class)->only(['index', 'show']);
        Route::apiResource('bookings', \App\Http\Controllers\Api\Admin\BookingController::class)->only(['index', 'show']);
        
        // Shared Resources
        Route::apiResource('ports', \App\Http\Controllers\Api\PortController::class)->only(['index', 'show']);
        Route::apiResource('subscription-plans', \App\Http\Controllers\Api\Admin\SubscriptionPlanController::class)->only(['index', 'show']);
    });

    // 3. SHARED RESOURCES (Super Admin, Admin, Manager, Guichetier, Comptable)
    Route::middleware(['role:super_admin|admin|manager|guichetier|comptable'])->group(function () {
        Route::apiResource('subscription-plans', \App\Http\Controllers\Api\Admin\SubscriptionPlanController::class)->only(['index', 'show']);
        Route::apiResource('bookings', \App\Http\Controllers\Api\Admin\BookingController::class)->only(['index', 'show']);
    });

    // 4. REPORTING (Super Admin, Admin, Manager, Comptable)
    Route::middleware(['role:super_admin|admin|manager|comptable'])->group(function () {
        Route::get('reports/sales', [\App\Http\Controllers\Api\Admin\ReportController::class, 'sales']);
        Route::get('reports/cash-desk/{cashDesk}/stats', [\App\Http\Controllers\Api\Admin\ReportController::class, 'cashDeskStats']);
        Route::get('reports/manifest/{trip}', [\App\Http\Controllers\Api\Admin\ReportController::class, 'manifest']);
    });

    // 6. SUPERVISOR OPERATIONS
    Route::middleware(['role:super_admin|admin|manager|superviseur_gare'])->group(function () {
         Route::group(['prefix' => 'supervisor', 'as' => 'supervisor.', 'middleware' => ['permission:supervisor.view_dashboard']], function () {
            Route::get('/dashboard', [\App\Http\Controllers\Api\Admin\SupervisorController::class, 'dashboard']);
            Route::get('/cash-desks', [\App\Http\Controllers\Api\Admin\SupervisorController::class, 'cashDesks']);
            Route::post('/cash-desks/{id}/close', [\App\Http\Controllers\Api\Admin\SupervisorController::class, 'closeCashDesk']);
            Route::get('/sales-history', [\App\Http\Controllers\Api\Admin\SupervisorController::class, 'salesHistory']);
        });
    });

    // 5. SECURITY & LOGS (Super Admin, Admin, Manager, Agent Embarquement)
    Route::middleware(['role:super_admin|admin|manager|agent_embarquement'])->group(function () {
        Route::get('access-logs', [\App\Http\Controllers\Api\Admin\AccessLogController::class, 'index']);
        Route::get('access-logs/latest', [\App\Http\Controllers\Api\Admin\AccessLogController::class, 'latest']);
    });
});
