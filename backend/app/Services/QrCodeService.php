<?php

namespace App\Services;

use App\Models\Ticket;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class QrCodeService
{
    /**
     * Générer les données du QR code pour un ticket
     * Format: V1|TICKET_ID|BOOKING_REF|TRIP_ID|HASH
     */
    public function generateForTicket(Ticket $ticket): string
    {
        // Générer la signature HMAC
        $signature = hash_hmac('sha256', $ticket->id . $ticket->booking->booking_reference, config('app.key'));
        $shortSignature = substr($signature, 0, 8);

        // Format: VERSION|TICKET_ID|BOOKING_REF|OUTWARD_ID|RETURN_ID|HASH
        return implode('|', [
            'V2', // Version du format
            $ticket->id,
            $ticket->booking->booking_reference,
            $ticket->trip_id,
            $ticket->return_trip_id ?? '',
            $shortSignature
        ]);
    }

    /**
     * Retourne l'image QR code en Base64 pour l'intégration PDF.
     */
    public function getBase64Qr(Ticket $ticket): string
    {
        $data = $this->generateForTicket($ticket);
        
        // Génère un PNG base64
        $image = QrCode::format('png')
            ->size(200)
            ->errorCorrection('H')
            ->generate($data);

        return 'data:image/png;base64,' . base64_encode($image);
    }

    // Méthodes placeholder pour éviter les erreurs si appelées depuis le modèle
    public function getQrCodeUrl(Ticket $ticket): ?string
    {
        return null; // Pas (encore) d'URL publique
    }

    public function markAsUsed(Ticket $ticket): void
    {
        $ticket->update(['used_at' => now(), 'status' => 'used']);
    }
}
