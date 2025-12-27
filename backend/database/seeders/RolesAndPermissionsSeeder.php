<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Définir les permissions clés (si elles n'existent pas déjà via Shield)
        // Note: Shield génère souvent ça automatiquement, mais on force certaines ici pour être sûr.
        $permissions = [
            // Gestion des réservations
            'view_any_booking', 'view_booking', 'create_booking', 'update_booking', 'delete_booking',
            // Gestion de l'embarquement
            'view_any_trip', 
            'scan_qr_code', // Permission spécifique custom
            'validate_boarding', // Permission spécifique custom
            // Gestion financière
            'view_any_payment', 'view_financial_reports',
            // Gestion technique
            'view_any_user', 'create_user', 'update_user', 'delete_user',
            'view_any_shield::role',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // 2. Créer les Rôles et assigner les permissions

        // SUPER ADMIN (tous les droits)
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        // Pas besoin d'assigner, Shield gère ça via config ou Gate::before

        // MANAGER (Gestion Opérationnelle - Flotte, Trajets, mais pas Users/Settings avancés)
        $manager = Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'web']);
        $manager->givePermissionTo([
            'view_any_booking', 'view_booking', 'create_booking', 'update_booking',
            'view_any_trip',
            'view_any_payment', 'view_financial_reports',
        ]);

        // GUICHETIER (Vente uniquement)
        $guichetier = Role::firstOrCreate(['name' => 'guichetier', 'guard_name' => 'web']);
        $guichetier->givePermissionTo([
            'view_any_booking', 'view_booking', 'create_booking', // Peut vendre
            'view_any_trip', // Doit voir les trajets pour vendre
        ]);

        // AGENT EMBARQUEMENT (Validation uniquement)
        $agentEmb = Role::firstOrCreate(['name' => 'agent_embarquement', 'guard_name' => 'web']);
        $agentEmb->givePermissionTo([
            'view_any_trip', // Doit voir le navire
            'scan_qr_code',
            'validate_boarding',
        ]);

        // COMPTABLE (Vue financière uniquement)
        $comptable = Role::firstOrCreate(['name' => 'comptable', 'guard_name' => 'web']);
        $comptable->givePermissionTo([
            'view_any_payment',
            'view_financial_reports',
            'view_any_booking',
        ]);

        // CLIENT (Utilisateur final)
        $client = Role::firstOrCreate(['name' => 'client', 'guard_name' => 'web']);
        $client->givePermissionTo([
            'view_booking',
            'create_booking',
        ]);
    }
}
