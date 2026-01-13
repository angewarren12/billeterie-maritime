<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Booking;
use App\Models\Ticket;
use App\Models\Trip;
use App\Models\Port;
use App\Models\Route;
use App\Models\Ship;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

/**
 * Seeder pour simuler une charge réelle à l'échelle du Sénégal.
 * Génère des volumes importants de données pour les tests de performance.
 */
class ScaleSenegalSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Préparation des noms courants pour le réalisme
        $firstNames = ['Abdoulaye', 'Moussa', 'Fatou', 'Aminata', 'Ousmane', 'Mariama', 'Ibrahima', 'Khady', 'Amath', 'Sokhna', 'Modou', 'Anta', 'Cheikh', 'Awa', 'Babacar', 'Coumba'];
        $lastNames = ['Ndiaye', 'Diop', 'Fall', 'Faye', 'Sane', 'Gueye', 'Sow', 'Ba', 'Diallo', 'Cisse', 'Badiane', 'Sy', 'Toure', 'Drame', 'Seck', 'Niang'];

        $this->command->info("Début de la génération massive de données...");

        // 2. Création de 2 000 clients fictifs (pour commencer, ajustable selon vos besoins)
        $this->command->info("Création des clients...");
        $users = [];
        for ($i = 0; $i < 2000; $i++) {
            $fName = $firstNames[array_rand($firstNames)];
            $lName = $lastNames[array_rand($lastNames)];
            $users[] = [
                'name' => "$fName $lName",
                'email' => strtolower($fName . '.' . $lName . $i . '@example.sn'),
                'password' => Hash::make('password123'),
                'phone' => '77' . rand(1000000, 9999999),
                'role' => 'client',
                'nationality_group' => rand(0, 10) > 8 ? 'african' : 'national',
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Insertion par lots pour la performance (tous les 500)
            if (count($users) >= 500) {
                User::insert($users);
                $users = [];
            }
        }
        if (count($users) > 0) User::insert($users);

        // 3. Récupération des données de base existing
        $ports = Port::all();
        $trips = Trip::all();
        
        if ($trips->isEmpty()) {
            $this->command->error("Aucun trajet trouvé. Veuillez lancer les seeders de base (MaritimeSeeder, TripSeeder) avant celui-ci.");
            return;
        }

        $allUsers = User::where('role', 'client')->pluck('id')->toArray();

        // 4. Génération massive de réservations et tickets (10 000 réservations)
        $this->command->info("Génération des réservations (10 000)...");
        
        for ($batch = 0; $batch < 20; $batch++) { // 20 lots de 500
            $bookingsBatch = [];
            for ($i = 0; $i < 500; $i++) {
                $bookingId = Str::uuid()->toString();
                $trip = $trips->random();
                
                $bookingsBatch[] = [
                    'id' => $bookingId,
                    'user_id' => $allUsers[array_rand($allUsers)],
                    'trip_id' => $trip->id,
                    'booking_reference' => 'SN-' . strtoupper(Str::random(8)),
                    'total_amount' => rand(5000, 25000),
                    'status' => rand(0, 10) > 2 ? 'confirmed' : 'pending',
                    'created_at' => Carbon::now()->subDays(rand(0, 60)),
                    'updated_at' => now(),
                ];
            }
            Booking::insert($bookingsBatch);
            
            // Création des tickets correspondants pour chaque lot
            $ticketsBatch = [];
            foreach ($bookingsBatch as $b) {
                $numTickets = rand(1, 4);
                for ($j = 0; $j < $numTickets; $j++) {
                    $ticketsBatch[] = [
                        'id' => Str::uuid()->toString(),
                        'booking_id' => $b['id'],
                        'trip_id' => $b['trip_id'],
                        'passenger_name' => $firstNames[array_rand($firstNames)] . ' ' . $lastNames[array_rand($lastNames)],
                        'passenger_type' => 'adult',
                        'nationality_group' => 'national',
                        'qr_code_data' => 'QR-' . Str::random(16),
                        'status' => 'valid',
                        'price_paid' => $b['total_amount'] / $numTickets,
                        'created_at' => $b['created_at'],
                        'updated_at' => now(),
                    ];
                }
            }
            Ticket::insert($ticketsBatch);
            $this->command->comment("Lot " . ($batch + 1) . "/20 terminé...");
        }

        $this->command->info("Test de population terminé avec succès !");
    }
}
