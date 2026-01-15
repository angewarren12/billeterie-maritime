<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Port;
use App\Models\Ship;
use App\Models\Route as MaritimeRoute;
use App\Models\PricingRule;
use App\Models\Trip;
use App\Models\SubscriptionPlan;
use App\Models\AccessDevice;
use App\Models\SupervisorAssignment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Carbon\Carbon;

class CleanProductionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // ---------------------------------------------------------
        // 1. ROLES ET PERMISSIONS
        // ---------------------------------------------------------
        $permissions = [
            'view_any_booking', 'view_booking', 'create_booking', 'update_booking', 'delete_booking',
            'view_any_trip', 'manage_trips', 'manage_fleet', 'manage_routes',
            'scan_qr_code', 'validate_boarding',
            'view_any_payment', 'view_financial_reports', 'manage_cash_desks',
            'pos.access', 'pos.sale', 'pos.session.close', 'pos.subscription.sale',
            'view_any_user', 'manage_users', 'manage_roles',
            // Permissions Superviseur
            'supervisor.view_dashboard', 'supervisor.manage_station', 'supervisor.close_cash_desk_remotely', 'supervisor.view_all_sales',
            // Permissions Agent Embarquement (New)
            'validate_disembarking', 'view_boarding_status', 'access_gate_control',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $rolesConfig = [
            'super_admin' => Permission::all(),
            'admin' => Permission::all(),
            'manager' => [
                'view_any_booking', 'view_booking', 'create_booking', 'update_booking',
                'view_any_trip', 'manage_trips', 'manage_fleet', 'manage_routes',
                'view_any_payment', 'view_financial_reports', 'manage_cash_desks',
            ],
            'guichetier' => [
                'view_any_booking', 'view_booking', 'create_booking',
                'view_any_trip',
                'pos.access', 'pos.sale', 'pos.session.close', 'pos.subscription.sale',
            ],
            'superviseur_gare' => [
                'view_any_booking', 'view_booking',
                'pos.access', 'view_financial_reports', 'manage_cash_desks',
                'view_any_user', 'view_any_trip', 'manage_trips',
                'supervisor.view_dashboard', 'supervisor.manage_station', 'supervisor.close_cash_desk_remotely', 'supervisor.view_all_sales',
            ],
            'agent_embarquement' => [
                'view_any_trip', 'scan_qr_code', 'validate_boarding',
                'validate_disembarking', 'view_boarding_status', 'access_gate_control',
            ],
            'comptable' => [
                'view_any_payment', 'view_financial_reports', 'view_any_booking',
            ],
            'client' => [
                'view_booking', 'create_booking',
            ],
        ];

        foreach ($rolesConfig as $roleName => $perms) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            $role->syncPermissions($perms);
        }

        // ---------------------------------------------------------
        // 2. UTILISATEURS
        // ---------------------------------------------------------
        $users = [
            [
                'name' => 'Super Admin',
                'email' => 'admin@maritime.sn',
                'password' => 'Admin@2026!',
                'role' => 'super_admin',
            ],
            [
                'name' => 'Gestionnaire Gorée',
                'email' => 'manager@maritime.sn',
                'password' => 'Manager@2026!',
                'role' => 'manager',
            ],
            [
                'name' => 'Superviseur Dakar',
                'email' => 'supervisor@maritime.sn',
                'password' => 'Super@2026!',
                'role' => 'superviseur_gare',
            ],
            [
                'name' => 'Guichetier Dakar',
                'email' => 'guichetier@maritime.sn',
                'password' => 'Vendeur@2026!',
                'role' => 'guichetier',
            ],
            [
                'name' => 'Agent de Bord',
                'email' => 'agent@maritime.sn',
                'password' => 'Agent@2026!',
                'role' => 'agent_embarquement',
            ],
        ];

        foreach ($users as $u) {
            $user = User::firstOrCreate(
                ['email' => $u['email']],
                [
                    'name' => $u['name'],
                    'password' => Hash::make($u['password']),
                    'role' => $u['role'],
                    'passenger_type' => 'adult',
                    'nationality_group' => 'national',
                ]
            );
            $user->assignRole($u['role']);
        }

        // ---------------------------------------------------------
        // 3. INFRASTRUCTURE (PORTS ET NAVIRES)
        // ---------------------------------------------------------
        $dakar = Port::firstOrCreate(
            ['code' => 'DKR'],
            ['name' => 'Gare Maritime de Dakar', 'city' => 'Dakar', 'country' => 'Sénégal']
        );

        $goree = Port::firstOrCreate(
            ['code' => 'GOR'],
            ['name' => 'Gare Maritime de Gorée', 'city' => 'Gorée', 'country' => 'Sénégal']
        );

        // Assign Supervisor to Dakar
        $supervisorUser = User::where('email', 'supervisor@maritime.sn')->first();
        if ($supervisorUser && $dakar) {
            SupervisorAssignment::updateOrCreate(
                ['user_id' => $supervisorUser->id],
                ['port_id' => $dakar->id, 'assigned_at' => now()]
            );
        }

        $coumba = Ship::firstOrCreate(
            ['name' => 'Coumba Castel'],
            [
                'company' => 'Liaison Maritime Dakar-Gorée',
                'type' => 'ferry',
                'capacity_pax' => 350,
                'is_active' => true
            ]
        );

        $beer = Ship::firstOrCreate(
            ['name' => 'Béer'],
            [
                'company' => 'Liaison Maritime Dakar-Gorée',
                'type' => 'ferry',
                'capacity_pax' => 150,
                'is_active' => true
            ]
        );

        // ---------------------------------------------------------
        // 4. TRAJETS ET TARIFICATION
        // ---------------------------------------------------------
        $routeDkrGor = MaritimeRoute::firstOrCreate(
            ['departure_port_id' => $dakar->id, 'arrival_port_id' => $goree->id],
            ['duration_minutes' => 20, 'is_active' => true]
        );

        $routeGorDkr = MaritimeRoute::firstOrCreate(
            ['departure_port_id' => $goree->id, 'arrival_port_id' => $dakar->id],
            ['duration_minutes' => 20, 'is_active' => true]
        );

        $prices = [
            'adult' => ['national' => 1500, 'resident' => 1500, 'african' => 3500, 'hors_afrique' => 6000],
            'child' => ['national' => 500, 'resident' => 500, 'african' => 2000, 'hors_afrique' => 3000],
        ];

        foreach ($prices as $type => $nats) {
            foreach ($nats as $nat => $price) {
                PricingRule::updateOrCreate(
                    ['route_id' => $routeDkrGor->id, 'passenger_type' => $type, 'nationality_group' => $nat],
                    ['base_price' => $price, 'tax_amount' => 0]
                );
                PricingRule::updateOrCreate(
                    ['route_id' => $routeGorDkr->id, 'passenger_type' => $type, 'nationality_group' => $nat],
                    ['base_price' => $price, 'tax_amount' => 0]
                );
            }
        }

        // ---------------------------------------------------------
        // 5. GÉNÉRATION DE VOYAGES (CALENDRIER 7 JOURS)
        // ---------------------------------------------------------
        $rotations = [
            '07:00', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00'
        ];

        // Seeding trips only if no trips exist for today to avoid duplication on re-seed
        $count = Trip::whereDate('departure_time', Carbon::today())->count();
        if ($count == 0) {
            for ($i = 0; $i < 7; $i++) {
                $date = Carbon::today()->addDays($i);
                
                foreach ($rotations as $time) {
                    $departure = Carbon::parse($date->format('Y-m-d') . ' ' . $time);
                    $arrival = $departure->copy()->addMinutes(20);

                    // Dakar -> Gorée (Coumba Castel)
                    Trip::create([
                        'route_id' => $routeDkrGor->id,
                        'ship_id' => $coumba->id,
                        'departure_time' => $departure,
                        'arrival_time' => $arrival,
                        'status' => 'scheduled',
                        'available_seats_pax' => $coumba->capacity_pax,
                    ]);

                    // Gorée -> Dakar (Béer lancée 30min après pour croisement)
                    Trip::create([
                        'route_id' => $routeGorDkr->id,
                        'ship_id' => $beer->id,
                        'departure_time' => $departure->copy()->addMinutes(30),
                        'arrival_time' => $arrival->copy()->addMinutes(30),
                        'status' => 'scheduled',
                        'available_seats_pax' => $beer->capacity_pax,
                    ]);
                }
            }
        }

        // ---------------------------------------------------------
        // 6. ABONNEMENTS ET ÉQUIPEMENTS
        // ---------------------------------------------------------
        SubscriptionPlan::firstOrCreate(
            ['name' => 'Badge Mensuel Illimité'],
            [
                'price' => 30000,
                'duration_days' => 30,
                'period' => 'MENSUEL',
                'category' => 'BADGE',
                'credit_type' => 'unlimited',
                'allow_multi_passenger' => false,
                'features' => ['Traversées illimitées', 'Droit de quai inclus'],
            ]
        );

        AccessDevice::firstOrCreate(
            ['device_identifier' => 'TR-DKR-01'],
            ['name' => 'Tourniquet Entrée Principal', 'location' => 'Dakar', 'type' => 'tripod']
        );

        $this->command->info('Seeder de production complet exécuté avec succès !');
        $this->command->info('Admin: admin@maritime.sn / Admin@2026!');
        $this->command->info('Superviseur: supervisor@maritime.sn / Super@2026!');
    }
}
