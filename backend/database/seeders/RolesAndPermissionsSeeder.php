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
            // Gestion de l'embarquement et logistique
            'view_any_trip', 'manage_trips', 'manage_fleet', 'manage_routes',
            'scan_qr_code', 'validate_boarding',
            // Gestion financière et guichets
            'view_any_payment', 'view_financial_reports', 'manage_cash_desks',
            // POS
            'pos.access', 'pos.sale', 'pos.session.close', 'pos.subscription.sale',
            // Gestion technique
            'view_any_user', 'manage_users', 'manage_roles',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // 2. Créer les Rôles et assigner les permissions

        // SUPER ADMIN (tous les droits techniques)
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        
        // ADMIN (Administrateur plateforme)
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->givePermissionTo(Permission::all());

        // MANAGER (Gestion Opérationnelle)
        $manager = Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'web']);
        $manager->givePermissionTo([
            'view_any_booking', 'view_booking', 'create_booking', 'update_booking',
            'view_any_trip', 'manage_trips', 'manage_fleet', 'manage_routes',
            'view_any_payment', 'view_financial_reports', 'manage_cash_desks',
        ]);

        // GUICHETIER (Vente et Caisse)
        $guichetier = Role::firstOrCreate(['name' => 'guichetier', 'guard_name' => 'web']);
        $guichetier->givePermissionTo([
            'view_any_booking', 'view_booking', 'create_booking', // Peut vendre
            'view_any_trip', // Pour voir les horaires
            'pos.access', 'pos.sale', 'pos.session.close', 'pos.subscription.sale',
        ]);

        // AGENT EMBARQUEMENT (Validation)
        $agentEmb = Role::firstOrCreate(['name' => 'agent_embarquement', 'guard_name' => 'web']);
        $agentEmb->givePermissionTo([
            'view_any_trip',
            'scan_qr_code',
            'validate_boarding',
        ]);

        // COMPTABLE (Audit Financier)
        $comptable = Role::firstOrCreate(['name' => 'comptable', 'guard_name' => 'web']);
        $comptable->givePermissionTo([
            'view_any_payment',
            'view_financial_reports',
            'view_any_booking',
        ]);

        // CLIENT (Passager)
        $client = Role::firstOrCreate(['name' => 'client', 'guard_name' => 'web']);
        $client->givePermissionTo([
            'view_booking',
            'create_booking',
        ]);
    }
}
