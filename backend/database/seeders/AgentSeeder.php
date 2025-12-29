<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AgentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // S'assurer que le rôle existe
        $role = Role::firstOrCreate(['name' => 'agent_embarquement', 'guard_name' => 'web']);

        // Création de l'agent de test
        $agent = User::updateOrCreate(
            ['email' => 'agent@portdakar.sn'],
            [
                'name' => 'Agent de Quai 01',
                'password' => Hash::make('password'),
                'phone' => '771234567',
                'passenger_type' => 'adult',
                'nationality_group' => 'national',
                'email_verified_at' => now(),
            ]
        );

        $agent->assignRole($role);

        $this->command->info('Utilisateur Agent créé avec succès : agent@portdakar.sn / password');
    }
}
