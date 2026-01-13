<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class CashierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // On s'assure que le rôle guichetier existe
        $role = Role::firstOrCreate(['name' => 'guichetier', 'guard_name' => 'web']);

        $cashiers = [
            [
                'name' => 'Agent Caisse Dakar',
                'email' => 'caisse.dakar@maritime.sn',
                'phone' => '771000001',
                'password' => Hash::make('password123'),
            ],
            [
                'name' => 'Agent Caisse Ziguinchor',
                'email' => 'caisse.zig@maritime.sn',
                'phone' => '771000002',
                'password' => Hash::make('password123'),
            ],
        ];

        foreach ($cashiers as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                $data
            );
            $user->assignRole($role);
            $this->command->info("Created cashier: {$user->email}");
        }
    }
}
