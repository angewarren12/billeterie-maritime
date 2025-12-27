<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\AccessLog;
use App\Services\QrCodeService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TicketController extends Controller
{
    public function __construct(
        protected QrCodeService $qrCodeService
    ) {}

    /**
     * Validate ticket QR code
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function validateQr(Request $request): JsonResponse
    {
        $request->validate([
            'qr_data' => 'required|string',
            'device_id' => 'nullable|string',
        ]);

        $result = $this->qrCodeService->validateTicket($request->qr_data);

        if (!$result['valid']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 400);
        }

        $ticket = $result['ticket'];

        // Log access attempt
        AccessLog::create([
            'ticket_id' => $ticket->id,
            'device_id' => $request->device_id ?? 'unknown',
            'access_type' => 'scan',
            'status' => 'granted',
            'scanned_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'ticket' => [
                'id' => $ticket->id,
                'passenger_name' => $ticket->passenger_name,
                'passenger_type' => $ticket->passenger_type,
                'trip' => [
                    'departure' => $ticket->trip->route->departurePort->name,
                    'arrival' => $ticket->trip->route->arrivalPort->name,
                    'departure_time' => $ticket->trip->departure_time->format('d/m/Y H:i'),
                ],
                'status' => $ticket->status,
            ],
        ]);
    }

    /**
     * Mark ticket as used (for boarding)
     * 
     * @param Request $request
     * @param string $qrData
     * @return JsonResponse
     */
    public function markAsUsed(Request $request, string $qrData): JsonResponse
    {
        $result = $this->qrCodeService->validateTicket($qrData);

        if (!$result['valid']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 400);
        }

        $ticket = $result['ticket'];

        // Mark as used
        $this->qrCodeService->markAsUsed($ticket);

        // Log boarding
        AccessLog::create([
            'ticket_id' => $ticket->id,
            'device_id' => $request->device_id ?? 'unknown',
            'access_type' => 'boarding',
            'status' => 'granted',
            'scanned_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Embarquement validé',
            'ticket' => [
                'id' => $ticket->id,
                'passenger_name' => $ticket->passenger_name,
                'used_at' => $ticket->used_at->format('d/m/Y H:i:s'),
            ],
        ]);
    }

    /**
     * Get ticket details by QR code
     * 
     * @param string $qrData
     * @return JsonResponse
     */
    public function getByQr(string $qrData): JsonResponse
    {
        $data = $this->qrCodeService->decryptQrData($qrData);

        if (!$data) {
            return response()->json([
                'success' => false,
                'message' => 'QR Code invalide',
            ], 400);
        }

        $ticket = Ticket::with(['booking', 'trip.route.departurePort', 'trip.route.arrivalPort'])
            ->find($data['ticket_id']);

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Billet introuvable',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'ticket' => [
                'id' => $ticket->id,
                'booking_reference' => $ticket->booking->booking_reference,
                'passenger_name' => $ticket->passenger_name,
                'passenger_type' => $ticket->passenger_type,
                'nationality_group' => $ticket->nationality_group,
                'price_paid' => $ticket->price_paid,
                'status' => $ticket->status,
                'trip' => [
                    'departure_port' => $ticket->trip->route->departurePort->name,
                    'arrival_port' => $ticket->trip->route->arrivalPort->name,
                    'departure_time' => $ticket->trip->departure_time->format('d/m/Y H:i'),
                    'arrival_time' => $ticket->trip->arrival_time?->format('d/m/Y H:i'),
                ],
                'qr_code_url' => $ticket->getQrCodeUrl(),
            ],
        ]);
    }
}
