<?php

namespace App\Services;

use App\Models\Ticket;
use App\Models\AccessLog;
use Illuminate\Support\Facades\Log;

class QrScanService
{
    /**
     * Valider un QR code et enregistrer l'accès
     * 
     * @param string $qrData - Données du QR code (format: V1|TICKET_ID|BOOKING_REF|TRIP_ID|HASH)
     * @param int|null $deviceId - ID du dispositif de scan (optionnel)
     * @return array - Résultat de la validation
     */
    public function validateQrCode(string $qrData, ?int $deviceId = null): array
    {
        try {
            // 1. Parser le QR code
            $parts = explode('|', $qrData);
            
            if (count($parts) !== 5) {
                return [
                    'status' => 'error',
                    'code' => 'INVALID_FORMAT',
                    'message' => 'Format de QR code invalide'
                ];
            }

            [$version, $ticketId, $bookingRef, $tripId, $hash] = $parts;

            // 2. Vérifier la version
            if ($version !== 'V1') {
                return [
                    'status' => 'error',
                    'code' => 'UNSUPPORTED_VERSION',
                    'message' => 'Version de QR code non supportée'
                ];
            }

            // 3. Vérifier la signature HMAC
            $expectedHash = $this->generateHash($ticketId, $bookingRef);
            
            if ($hash !== $expectedHash) {
                Log::warning('QR Code forgé détecté', [
                    'ticket_id' => $ticketId,
                    'expected_hash' => $expectedHash,
                    'received_hash' => $hash
                ]);

                return [
                    'status' => 'error',
                    'code' => 'INVALID_SIGNATURE',
                    'message' => 'QR Code invalide ou falsifié'
                ];
            }

            // 4. Charger le ticket
            $ticket = Ticket::with(['trip.route.departurePort', 'trip.route.arrivalPort', 'trip.ship', 'booking'])
                ->find($ticketId);

            if (!$ticket) {
                return [
                    'status' => 'error',
                    'code' => 'TICKET_NOT_FOUND',
                    'message' => 'Billet introuvable dans la base de données'
                ];
            }

            // 5. Vérifications métier
            
            // Vérifier que le billet correspond bien au voyage
            if ($ticket->trip_id != $tripId) {
                return [
                    'status' => 'error',
                    'code' => 'WRONG_TRIP',
                    'message' => 'Ce billet n\'est pas valide pour ce voyage',
                    'details' => [
                        'ticket_trip' => $ticket->trip->route->name,
                        'scanned_trip_id' => $tripId
                    ]
                ];
            }

            // Vérifier si déjà utilisé
            if ($ticket->status === 'boarded') {
                return [
                    'status' => 'error',
                    'code' => 'ALREADY_USED',
                    'message' => 'Passager déjà embarqué',
                    'details' => [
                        'used_at' => $ticket->used_at ? $ticket->used_at->format('d/m/Y H:i') : null,
                        'passenger_name' => $ticket->passenger_name
                    ]
                ];
            }

            // Vérifier si le billet est annulé
            if ($ticket->status === 'cancelled') {
                return [
                    'status' => 'error',
                    'code' => 'CANCELLED',
                    'message' => 'Billet annulé'
                ];
            }

            // Vérifier l'horaire de départ
            $departureTime = $ticket->trip->departure_time;
            $now = now();

            if ($departureTime->isPast() && $departureTime->diffInHours($now) > 1) {
                return [
                    'status' => 'warning',
                    'code' => 'DEPARTED',
                    'message' => 'Le navire est déjà parti',
                    'details' => [
                        'departure_time' => $departureTime->format('d/m/Y H:i'),
                        'passenger_name' => $ticket->passenger_name
                    ]
                ];
            }

            // 6. Marquer comme embarqué
            $ticket->update([
                'status' => 'boarded',
                'used_at' => now()
            ]);

            // 7. Enregistrer le log d'accès
            AccessLog::create([
                'ticket_id' => $ticket->id,
                'device_id' => $deviceId,
                'access_type' => 'boarding',
                'status' => 'granted',
                'scanned_at' => now()
            ]);

            // 8. Retourner succès
            return [
                'status' => 'success',
                'code' => 'BOARDING_AUTHORIZED',
                'message' => 'Embarquement autorisé ✓',
                'passenger' => [
                    'name' => $ticket->passenger_name,
                    'type' => $this->getPassengerTypeLabel($ticket->passenger_type),
                    'nationality' => $this->getNationalityLabel($ticket->nationality_group),
                    'seat' => $ticket->seat_number ?? 'Non attribué'
                ],
                'trip' => [
                    'route' => $ticket->trip->route->name,
                    'ship' => $ticket->trip->ship->name,
                    'departure' => $departureTime->format('d/m/Y à H:i')
                ],
                'booking_reference' => $ticket->booking->booking_reference
            ];

        } catch (\Exception $e) {
            Log::error('Erreur lors de la validation QR', [
                'qr_data' => $qrData,
                'error' => $e->getMessage()
            ]);

            return [
                'status' => 'error',
                'code' => 'SYSTEM_ERROR',
                'message' => 'Erreur système lors de la validation',
                'details' => config('app.debug') ? $e->getMessage() : null
            ];
        }
    }

    /**
     * Générer le hash de signature
     */
    private function generateHash(string $ticketId, string $bookingRef): string
    {
        $signature = hash_hmac('sha256', $ticketId . $bookingRef, config('app.key'));
        return substr($signature, 0, 8);
    }

    /**
     * Labels lisibles pour les types de passagers
     */
    private function getPassengerTypeLabel(string $type): string
    {
        return match($type) {
            'adult' => 'Adulte',
            'child' => 'Enfant',
            'baby' => 'Bébé',
            default => ucfirst($type)
        };
    }

    /**
     * Labels lisibles pour les nationalités
     */
    private function getNationalityLabel(string $group): string
    {
        return match($group) {
            'national' => 'National/CEDEAO',
            'resident' => 'Résident',
            'non-resident' => 'Étranger',
            default => ucfirst($group)
        };
    }

    /**
     * Obtenir les statistiques de scan pour un agent
     */
    public function getAgentStatistics(int $deviceId, ?string $date = null): array
    {
        $query = AccessLog::where('device_id', $deviceId);

        if ($date) {
            $query->whereDate('scanned_at', $date);
        } else {
            $query->whereDate('scanned_at', today());
        }

        $total = $query->count();
        $granted = $query->where('status', 'granted')->count();
        $denied = $total - $granted;

        return [
            'device_id' => $deviceId,
            'date' => $date ?? today()->format('Y-m-d'),
            'total_scans' => $total,
            'granted' => $granted,
            'denied' => $denied,
            'success_rate' => $total > 0 ? round(($granted / $total) * 100, 2) : 0
        ];
    }
}
