<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccessDevice;
use App\Services\QrScanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DeviceScanController extends Controller
{
    protected $qrScanService;

    public function __construct(QrScanService $qrScanService)
    {
        $this->qrScanService = $qrScanService;
    }

    /**
     * Valider un scan provenant d'un équipement fixe (Tourniquet)
     * 
     * POST /api/device/scan
     * Header: X-Device-Token: [TOKEN]
     */
    public function validate(Request $request): JsonResponse
    {
        $token = $request->header('X-Device-Token');
        
        if (!$token) {
            return response()->json([
                'status' => 'error',
                'open' => false,
                'message' => 'Token de périphérique manquant'
            ], 401);
        }

        $device = AccessDevice::where('api_token', $token)->first();

        if (!$device) {
            return response()->json([
                'status' => 'error',
                'open' => false,
                'message' => 'Dispositif non reconnu'
            ], 401);
        }

        $validated = $request->validate([
            'uid' => 'required|string', // UID RFID ou code QR
            'direction' => 'nullable|string|in:in,out',
        ]);

        $inputData = $validated['uid'];
        $direction = $validated['direction'] ?? 'in';

        // Utilisation du service existant pour valider
        if (str_starts_with($inputData, 'V1|')) {
            $result = $this->qrScanService->validateQrCode($inputData, $device->id, ($direction === 'in' ? 'entry' : 'exit'));
        } else {
            $result = $this->qrScanService->validateRfid($inputData, $device->id, ($direction === 'in' ? 'entry' : 'exit'));
        }

        // Transformer le résultat pour le hardware (plus simple)
        $isAuthorized = ($result['status'] === 'success' || $result['status'] === 'warning');

        return response()->json([
            'status' => $result['status'],
            'open' => $isAuthorized,
            'message' => $result['message'],
            'passenger_name' => $result['passenger']['name'] ?? $result['badge_info']['owner_name'] ?? 'Inconnu',
            'timestamp' => now()->toIso8601String()
        ], $isAuthorized ? 200 : 400);
    }
}
