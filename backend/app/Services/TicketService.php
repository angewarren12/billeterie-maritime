<?php

namespace App\Services;

use App\Models\Booking;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class TicketService
{
    protected $qrCodeService;

    public function __construct(QrCodeService $qrCodeService)
    {
        $this->qrCodeService = $qrCodeService;
    }

    /**
     * Génère le fichier PDF contenant tous les billets de la réservation.
     */
    public function generatePdf(Booking $booking)
    {
        $booking->load(['tickets.trip.route.departurePort', 'tickets.trip.route.arrivalPort', 'tickets.trip.ship']);

        // Préparer les données pour chaque ticket (QR code base64)
        $ticketsData = [];
        foreach ($booking->tickets as $ticket) {
            $ticketsData[] = [
                'model' => $ticket,
                'qr_code' => $this->qrCodeService->getBase64Qr($ticket),
            ];
        }

        $pdf = Pdf::loadView('pdf.ticket', [
            'booking' => $booking,
            'tickets' => $ticketsData,
        ]);

        // Configuration papier A4
        $pdf->setPaper('a4', 'portrait');

        return $pdf;
    }
}
