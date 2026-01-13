<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Port;
use App\Models\Ship;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class MinimalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 2. Roles & Permissions Minimalistes
        $roles = ['super_admin', 'agent', 'client'];
        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        // 3. Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@billeterie.sn'],
            [
                'name' => 'Administrateur',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'passenger_type' => 'adult',
                'nationality_group' => 'national',
            ]
        );
        $admin->assignRole('super_admin');

        // 4. Ports (Gares)
        $dakar = Port::create([
            'name' => 'Gare Maritime de Dakar',
            'code' => 'DKR',
            'city' => 'Dakar',
            'country' => 'Sénégal',
        ]);

        $goree = Port::create([
            'name' => 'Gare Maritime de Gorée',
            'code' => 'GOR',
            'city' => 'Gorée',
            'country' => 'Sénégal',
        ]);

        // 5. Ships (Navires)
        Ship::create([
            'name' => 'Coumba Castel',
            'company' => 'LMG',
            'type' => 'Ferry',
            'capacity_pax' => 350,
            'is_active' => true,
        ]);

        Ship::create([
            'name' => 'Béer',
            'company' => 'LMG',
            'type' => 'Ferry',
            'capacity_pax' => 150,
            'is_active' => true,
        ]);

        $this->command->info('Minimalist seeding completed successfully!');
        $this->command->info('Admin: admin@billeterie.sn / admin123');
    }
}
