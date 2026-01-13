<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $start = microtime(true);
        $query = Booking::query()
            ->latest();

        // Si on demande les réservations pour le dashboard, on peut alléger le chargement
        $with = ['user', 'tickets', 'trip.route.departurePort', 'trip.route.arrivalPort', 'transactions'];
        $query->with($with);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('booking_reference', 'like', "%{$search}%")
                  ->orWhereHas('user', function($u) use ($search) {
                      $u->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $bookings = $query->paginate(15);

        return response()->json([
            'data' => $bookings,
            'internal_time_ms' => round((microtime(true) - $start) * 1000)
        ]);
    }

    public function show($id)
    {
        $start = microtime(true);
        $booking = Booking::with(['user', 'tickets.trip.route', 'transactions'])->findOrFail($id);
        
        return response()->json([
            'data' => $booking,
            'internal_time_ms' => round((microtime(true) - $start) * 1000)
        ]);
    }
}
