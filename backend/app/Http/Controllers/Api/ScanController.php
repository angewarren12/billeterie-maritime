<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\QrScanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScanController extends Controller
{
    protected $qrScanService;

    public function __construct(QrScanService $qrScanService)
    {
        $this->qrScanService = $qrScanService;
    }

    /**
     * Scanner et valider un QR code
     * 
     * POST /api/scan/validate
     */
    public function validate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'qr_data' => 'required|string',
            'device_id' => 'nullable|integer'
        ]);

        $result = $this->qrScanService->validateQrCode(
            $validated['qr_data'],
            $validated['device_id'] ?? null
        );

        // Déterminer le code HTTP selon le résultat
        $statusCode = match($result['status']) {
            'success' => 200,
            'warning' => 200, // Succès avec avertissement
            'error' => 400,
            default => 500
        };

        return response()->json($result, $statusCode);
    }

    /**
     * Obtenir les statistiques de scan d'un agent
     * 
     * GET /api/scan/statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'device_id' => 'required_without:trip_id|integer',
            'trip_id' => 'required_without:device_id|string',
            'date' => 'nullable|date_format:Y-m-d'
        ]);

        if ($request->has('trip_id')) {
            $tripId = $validated['trip_id'];
            $totalTickets = \App\Models\Ticket::where('trip_id', $tripId)->count();
            $boardedCount = \App\Models\Ticket::where('trip_id', $tripId)
                ->where('status', 'boarded')
                ->count();

            return response()->json([
                'trip_id' => $tripId,
                'total_passengers' => $totalTickets,
                'boarding_count' => $boardedCount,
            ]);
        }

        $stats = $this->qrScanService->getAgentStatistics(
            $validated['device_id'],
            $validated['date'] ?? null
        );

        return response()->json($stats);
    }

    /**
     * Synchroniser les validations hors-ligne
     * 
     * POST /api/scan/sync
     */
    public function sync(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'device_id' => 'required|integer',
            'validations' => 'required|array',
            'validations.*.qr_data' => 'required|string',
            'validations.*.timestamp' => 'required|date',
        ]);

        $results = [];
        $successCount = 0;
        $errorCount = 0;

        foreach ($validated['validations'] as $validation) {
            $result = $this->qrScanService->validateQrCode(
                $validation['qr_data'],
                $validated['device_id']
            );

            if ($result['status'] === 'success') {
                $successCount++;
            } else {
                $errorCount++;
            }

            $results[] = [
                'qr_data' => substr($validation['qr_data'], 0, 20) . '...',
                'status' => $result['status'],
                'code' => $result['code']
            ];
        }

        return response()->json([
            'message' => 'Synchronisation terminée',
            'summary' => [
                'total' => count($validated['validations']),
                'success' => $successCount,
                'errors' => $errorCount
            ],
            'details' => $results
        ]);
    }

    /**
     * Obtenir la liste des passages d'un voyage
     * 
     * GET /api/scan/trip/{trip_id}/passengers
     */
    public function tripPassengers(Request $request, string $tripId): JsonResponse
    {
        $tickets = \App\Models\Ticket::where('trip_id', $tripId)
            ->with(['booking'])
            ->get();

        $passengers = $tickets->map(function ($ticket) {
            return [
                'ticket_id' => $ticket->id,
                'passenger_name' => $ticket->passenger_name,
                'passenger_type' => $ticket->passenger_type,
                'status' => $ticket->status,
                'used_at' => $ticket->used_at ? $ticket->used_at->format('H:i') : null,
                'booking_reference' => $ticket->booking->booking_reference
            ];
        });

        return response()->json([
            'trip_id' => $tripId,
            'total_passengers' => $passengers->count(),
            'boarded' => $passengers->where('status', 'used')->count(),
            'pending' => $passengers->where('status', 'issued')->count(),
            'passengers' => $passengers
        ]);
    }
}
