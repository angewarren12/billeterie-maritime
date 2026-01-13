<?php

namespace App\Services;

use App\Models\Ticket;
use App\Models\AccessLog;
use Illuminate\Support\Facades\Log;

class QrScanService
{
    /**
     * Valider un badge RFID et enregistrer l'accès
     * 
     * @param string $rfidCode - Code RFID ou UID
     * @param int|null $deviceId - ID du dispositif de scan
     * @return array - Résultat de la validation
     */
    public function validateRfid(string $rfidCode, ?int $deviceId = null, string $direction = 'entry'): array
    {
        try {
            $subscription = \App\Models\Subscription::where('rfid_card_id', $rfidCode)
                ->with(['plan', 'user'])
                ->first();

            if (!$subscription) {
                return [
                    'status' => 'error',
                    'code' => 'RFID_NOT_FOUND',
                    'message' => 'Badge RFID inconnu ou non associé'
                ];
            }

            // 1.5 Anti-Replay / Double Scan / Anti-Passback
            $lastAccess = AccessLog::where('subscription_id', $subscription->id)
                ->where('result', 'granted')
                ->where('direction', 'entry')
                ->latest('scanned_at')
                ->first();

            if ($lastAccess) {
                $secondsSinceLast = now()->diffInSeconds($lastAccess->scanned_at);
                $isMulti = $subscription->plan ? $subscription->plan->allow_multi_passenger : false;

                // Bloquer si multi-passager désactivé et scan < 5 min (Anti-Passback)
                if (!$isMulti && $secondsSinceLast < 300) {
                    return [
                        'status' => 'error',
                        'code' => 'ANTI_PASSBACK',
                        'message' => 'Badge déjà utilisé récemment. Attendez 5 minutes.',
                        'details' => ['wait_seconds' => 300 - $secondsSinceLast]
                    ];
                }

                // Toujours bloquer si scan < 3 secondes (Anti-Replay hardware)
                if ($secondsSinceLast < 3) {
                    return [
                        'status' => 'error',
                        'code' => 'SCAN_TOO_FAST',
                        'message' => 'Scan trop rapide, veuillez patienter',
                        'details' => ['wait_seconds' => 3 - $secondsSinceLast]
                    ];
                }
            }

            // 2. Vérifier si l'abonnement est actif
            // 2. Vérifier si l'abonnement est actif
            if (!$subscription->isActive()) {
                // Enregistrer une tentative refusée
                AccessLog::create([
                    'subscription_id' => $subscription->id,
                    'device_id' => $deviceId,
                    'result' => 'denied',
                    'direction' => $direction,
                    'deny_reason' => 'Subscription inactive or expired',
                    'scanned_at' => now(),
                ]);

                return [
                    'status' => 'error',
                    'code' => 'BADGE_INACTIVE',
                    'message' => "L'abonnement est inactif ou expiré",
                    'details' => [
                        'status' => $subscription->status,
                        'end_date' => $subscription->end_date->format('d/m/Y')
                    ]
                ];
            }

            // 3. Vérifier les crédits si c'est un plan compté
            if ($subscription->plan && $subscription->plan->credit_type === \App\Models\SubscriptionPlan::TYPE_COUNTED) {
                if ($subscription->voyage_credits_remaining <= 0) {
                    return [
                        'status' => 'error',
                        'code' => 'INSUFFICIENT_CREDITS',
                        'message' => 'Crédits voyage insuffisants'
                    ];
                }
                
                // Déduire un crédit
                $subscription->deductTripCredits(1);
            }

            // 4. Enregistrer le succès de l'accès
            AccessLog::create([
                'subscription_id' => $subscription->id,
                'device_id' => $deviceId,
                'result' => 'granted',
                'direction' => $direction,
                'scanned_at' => now()
            ]);

            return [
                'status' => 'success',
                'code' => 'ACCESS_GRANTED',
                'message' => 'Passage autorisé ✓',
                'badge_info' => [
                    'owner_name' => $subscription->user ? $subscription->user->name : 'Client Badge',
                    'plan_name' => $subscription->plan_name,
                    'credits_remaining' => $subscription->plan->credit_type === 'unlimited' ? 'ILLIMITÉ' : $subscription->voyage_credits_remaining,
                    'expiry_date' => $subscription->end_date->format('d/m/Y')
                ]
            ];

        } catch (\Exception $e) {
            Log::error('Erreur lors de la validation RFID', [
                'rfid_code' => $rfidCode,
                'error' => $e->getMessage()
            ]);

            return [
                'status' => 'error',
                'code' => 'SYSTEM_ERROR',
                'message' => 'Erreur système lors du scan',
                'details' => config('app.debug') ? $e->getMessage() : null
            ];
        }
    }

    /**
     * Valider un QR code et enregistrer l'accès
     * 
     * @param string $qrData - Données du QR code (format: V1|TICKET_ID|BOOKING_REF|TRIP_ID|HASH)
     * @param int|null $deviceId - ID du dispositif de scan (optionnel)
     * @return array - Résultat de la validation
     */
    public function validateQrCode(string $qrData, ?int $deviceId = null, string $direction = 'entry'): array
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
                'result' => 'granted',
                'direction' => $direction,
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
        return \App\Models\Ticket::TYPE_LABELS[$type] ?? ucfirst($type);
    }

    /**
     * Labels lisibles pour les nationalités
     */
    private function getNationalityLabel(string $group): string
    {
        return \App\Models\Ticket::NATIONALITY_LABELS[$group] ?? ucfirst($group);
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
        $granted = $query->where('result', 'granted')->count();
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
    /**
     * Forcer la validation d'un QR code (Bypass Superviseur)
     */
    public function forceValidateQrCode(string $qrData, string $reason, ?int $deviceId = null): array
    {
        try {
            // 1. Parser le QR code (même logique)
            $parts = explode('|', $qrData);
            if (count($parts) !== 5) {
                return ['status' => 'error', 'message' => 'Format invalide'];
            }
            [$version, $ticketId, $bookingRef, $tripId, $hash] = $parts;

            // 2. Charger le ticket
            $ticket = Ticket::with(['trip', 'booking'])->find($ticketId);
            if (!$ticket) {
                return ['status' => 'error', 'message' => 'Billet introuvable'];
            }

            // 3. Appliquer le bypass
            $previousStatus = $ticket->status;
            
            // On marque comme boardé même si c'était annulé ou autre
            $ticket->update([
                'status' => 'boarded',
                'used_at' => now()
            ]);

            // 4. Enregistrer le log avec status 'bypass'
            AccessLog::create([
                'ticket_id' => $ticket->id,
                'device_id' => $deviceId,
                'result' => 'bypass',
                'direction' => 'entry',
                'deny_reason' => "Forcé par superviseur: $reason (Statut précédent: $previousStatus)",
                'scanned_at' => now()
            ]);

            return [
                'status' => 'success',
                'code' => 'BYPASS_GRANTED',
                'message' => 'Passage forcé autorisé',
                'passenger' => [
                    'name' => $ticket->passenger_name,
                    'type' => $ticket->passenger_type
                ]
            ];

        } catch (\Exception $e) {
            Log::error('Erreur bypass QR', ['error' => $e->getMessage()]);
            return ['status' => 'error', 'message' => 'Erreur système'];
        }
    }
}
