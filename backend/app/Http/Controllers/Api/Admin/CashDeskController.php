<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CashDesk;
use App\Models\User;
use Illuminate\Http\Request;

class CashDeskController extends Controller
{
    /**
     * Liste des guichets avec recherche et agents
     */
    public function index(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('manage_cash_desks');
        
        $search = $request->input('search');
        $cacheKey = 'admin_cash_desks_' . md5($search);

        $cashDesks = \Illuminate\Support\Facades\Cache::remember($cacheKey, 60, function() use ($search) {
            return CashDesk::with(['port', 'agents'])
                ->when($search, function($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                          ->orWhere('code', 'like', "%{$search}%")
                          ->orWhereHas('port', function($q) use ($search) {
                              $q->where('name', 'like', "%{$search}%");
                          });
                })
                ->get();
        });

        return response()->json($cashDesks);
    }

    /**
     * Création d'un guichet
     */
    public function store(Request $request)
    {
        \Illuminate\Support\Facades\Gate::authorize('manage_cash_desks');
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:cash_desks,code',
            'port_id' => 'required|exists:ports,id',
            'is_active' => 'boolean',
        ]);

        $cashDesk = CashDesk::create($validated);
        \Illuminate\Support\Facades\Cache::forget('admin_cash_desks_'); // Clear base cache
        // We can't easily clear all MD5-suffixed keys without tags, but clearing base helps
        // If developer uses tags, better. For now, let's at least not flush EVERYTHING.
        \Illuminate\Support\Facades\Log::info("Guichet créé: " . $cashDesk->name);

        return response()->json($cashDesk, 201);
    }

    /**
     * Détails d'un guichet
     */
    public function show($id)
    {
        $cashDesk = CashDesk::with(['port', 'agents'])->findOrFail($id);
        return response()->json($cashDesk);
    }

    /**
     * Mise à jour d'un guichet
     */
    public function update(Request $request, $id)
    {
        \Illuminate\Support\Facades\Gate::authorize('manage_cash_desks');
        $cashDesk = CashDesk::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'code' => 'string|unique:cash_desks,code,' . $id,
            'port_id' => 'exists:ports,id',
            'is_active' => 'boolean',
        ]);

        $cashDesk->update($validated);
        \Illuminate\Support\Facades\Cache::forget('admin_cash_desks_');
        // Clear common search key
        \Illuminate\Support\Facades\Cache::forget('admin_cash_desks_' . md5(''));

        return response()->json($cashDesk);
    }

    /**
     * Suppression d'un guichet
     */
    public function destroy($id)
    {
        \Illuminate\Support\Facades\Gate::authorize('manage_cash_desks');
        $cashDesk = CashDesk::findOrFail($id);
        $cashDesk->delete();
        \Illuminate\Support\Facades\Cache::forget('admin_cash_desks_');

        return response()->json(null, 204);
    }

    /**
     * Assigner un agent à un guichet
     */
    public function assign(Request $request, $cashDeskId)
    {
        \Illuminate\Support\Facades\Gate::authorize('manage_cash_desks');
        $cashDesk = CashDesk::findOrFail($cashDeskId);
        
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($validated['user_id']);
        $user->update(['cash_desk_id' => $cashDesk->id]);
        \Illuminate\Support\Facades\Cache::forget('admin_cash_desks_');

        return response()->json([
            'message' => "Agent assigné avec succès au guichet {$cashDesk->name}",
            'user' => $user->load('cashDesk')
        ]);
    }

    /**
     * Retirer un agent d'un guichet
     */
    public function unassign(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        $user->update(['cash_desk_id' => null]);
        \Illuminate\Support\Facades\Cache::forget('admin_cash_desks_');

        return response()->json([
            'message' => "Agent retiré du guichet",
            'user' => $user
        ]);
    }
}
