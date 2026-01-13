<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Liste des utilisateurs avec statistiques sommaires
     */
    public function index(Request $request): JsonResponse
    {
        \Illuminate\Support\Facades\Gate::authorize('view_any_user');
        $start = microtime(true);
        $search = $request->input('search');
        $role = $request->input('role');
        $type = $request->input('type'); // 'clients' or 'staff'

        $users = User::query()
            ->when($type === 'clients', function ($query) {
                $query->where('role', 'client');
            })
            ->when($type === 'staff', function ($query) {
                $query->where('role', '!=', 'client');
            })
            ->when($role && $role !== 'all' && $role !== 'staff', function ($query) use ($role) {
                $query->where('role', $role);
            })
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->withCount('bookings')
            ->with(['subscriptions' => function ($query) {
                $query->where('status', 'active')->with('plan');
            }])
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'total' => $users->total(),
                'per_page' => $users->perPage(),
            ],
            'internal_time_ms' => round((microtime(true) - $start) * 1000)
        ]);
    }

    /**
     * Créer un nouvel utilisateur (client, agent, etc.) par l'administrateur
     */
    public function store(Request $request): JsonResponse
    {
        \Illuminate\Support\Facades\Gate::authorize('manage_users');
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:6',
            'role' => 'required|in:client,agent_embarquement,guichetier,manager,comptable,admin',
            'nationality_group' => 'nullable|in:national,resident,african,hors_afrique',
            'passenger_type' => 'nullable|in:adult,child,baby',
            'document_number' => 'nullable|string|max:50',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'nationality_group' => $validated['nationality_group'] ?? 'national',
            'passenger_type' => $validated['passenger_type'] ?? 'adult',
            'document_number' => $validated['document_number'],
            'role' => $validated['role'],
        ]);

        // Assigner le rôle Spatie
        $user->assignRole($validated['role']);

        return response()->json([
            'message' => 'Utilisateur créé avec succès',
            'data' => $user
        ], 201);
    }

    /**
     * Détails complets d'un utilisateur
     */
    public function show(string $id): JsonResponse
    {
        \Illuminate\Support\Facades\Gate::authorize('view_any_user');
        $start = microtime(true);
        $user = User::where('id', $id)
            ->with([
                'bookings' => function ($query) {
                    $query->with(['trip.route', 'tickets'])->latest()->limit(10);
                },
                'subscriptions' => function ($query) {
                    $query->with('plan')->latest();
                },
                'tickets' => function ($query) {
                    $query->latest()->limit(10);
                }
            ])
            ->firstOrFail();

        $totalSpent = DB::table('transactions')
            ->join('bookings', 'transactions.booking_id', '=', 'bookings.id')
            ->where('bookings.user_id', $user->id)
            ->where('transactions.status', 'completed')
            ->sum('transactions.amount');

        $subscriptionIds = $user->subscriptions->pluck('id');
        $ticketIds = $user->tickets->pluck('id');

        $accessLogs = \App\Models\AccessLog::query()
            ->whereIn('subscription_id', $subscriptionIds)
            ->orWhereIn('ticket_id', $ticketIds)
            ->with(['device.port', 'subscription.plan'])
            ->latest()
            ->limit(20)
            ->get();

        return response()->json([
            'user' => $user,
            'stats' => [
                'total_bookings' => $user->bookings()->count(),
                'total_spent' => (float)$totalSpent,
                'active_badge' => $user->subscriptions()->where('status', 'active')->first(),
            ],
            'access_logs' => $accessLogs,
            'internal_time_ms' => round((microtime(true) - $start) * 1000)
        ]);
    }
}
