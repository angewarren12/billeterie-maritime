<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Trip;
use App\Models\Booking;
use App\Models\Ticket;

class ExpireOldBookings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bookings:expire';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Expire les réservations et billets pour les voyages passés';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Recherche des voyages passés...');

        // Récupérer tous les voyages dont l'heure de départ est passée
        $expiredTrips = Trip::where('departure_time', '<', now())
            ->where('status', '!=', 'cancelled')
            ->get();

        $this->info("📅 Trouvé {$expiredTrips->count()} voyage(s) passé(s)");

        $expiredTicketsCount = 0;
        $expiredBookingsCount = 0;

        foreach ($expiredTrips as $trip) {
            // Récupérer tous les billets NON utilisés pour ce voyage
            $ticketsToExpire = Ticket::where('trip_id', $trip->id)
                ->where('status', 'issued') // Seulement les billets émis (pas encore utilisés)
                ->get();

            foreach ($ticketsToExpire as $ticket) {
                $ticket->update(['status' => 'expired']);
                $expiredTicketsCount++;
            }

            // Récupérer les réservations associées à ces billets expirés
            $bookingIds = $ticketsToExpire->pluck('booking_id')->unique();
            
            foreach ($bookingIds as $bookingId) {
                $booking = Booking::find($bookingId);
                
                if ($booking && $booking->status === 'confirmed') {
                    // Vérifier si TOUS les billets de la réservation sont expirés ou utilisés
                    $allTicketsProcessed = $booking->tickets()
                        ->whereIn('status', ['expired', 'used'])
                        ->count() === $booking->tickets()->count();

                    if ($allTicketsProcessed) {
                        // Si au moins un billet est utilisé, status = completed
                        // Sinon, status = expired
                        $hasUsedTickets = $booking->tickets()
                            ->where('status', 'used')
                            ->exists();

                        $booking->update([
                            'status' => $hasUsedTickets ? 'completed' : 'expired'
                        ]);
                        $expiredBookingsCount++;
                    }
                }
            }
        }

        $this->info("✅ Expiration terminée :");
        $this->info("   - {$expiredTicketsCount} billet(s) expiré(s)");
        $this->info("   - {$expiredBookingsCount} réservation(s) mise(s) à jour");

        return Command::SUCCESS;
    }
}
