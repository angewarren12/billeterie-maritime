<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AccessLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccessLogController extends Controller
{
    /**
     * Liste des derniers logs d'accès pour le monitoring
     */
    public function index(Request $request): JsonResponse
    {
        $limit = $request->query('limit', 20);
        
        $logs = AccessLog::with(['subscription.user', 'subscription.plan', 'ticket.booking', 'ticket.trip', 'device'])
            ->orderBy('scanned_at', 'desc')
            ->paginate($limit);

        return response()->json($logs);
    }

    /**
     * Obtenir les derniers logs depuis un certain ID (pour polling)
     */
    public function latest(Request $request): JsonResponse
    {
        $lastId = $request->query('last_id');
        
        $query = AccessLog::with(['subscription.user', 'subscription.plan', 'ticket.booking', 'ticket.trip', 'device'])
            ->orderBy('scanned_at', 'desc');

        if ($lastId) {
            $query->where('id', '>', $lastId);
        }

        $logs = $query->limit(10)->get();

        return response()->json([
            'data' => $logs
        ]);
    }
}
