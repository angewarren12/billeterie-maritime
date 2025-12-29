<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. D'abord créer les rôles et permissions
        $this->call([
            RolesAndPermissionsSeeder::class,
        ]);

        // 2. Créer le Super Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => \Illuminate\Support\Facades\Hash::make('password'), // Mot de passe par défaut
                'role' => 'admin',
                'passenger_type' => 'adult',
                'nationality_group' => 'national',
            ]
        );
        
        $admin->assignRole('super_admin');

        // 3. Autres seeders
        $this->call([
            MaritimeSeeder::class,
            DummyDataSeeder::class,
            PricingSeeder::class,
            TripSeeder::class,
        ]);
    }
}
