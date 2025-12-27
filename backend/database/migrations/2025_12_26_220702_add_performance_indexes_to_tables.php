<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // BOOKINGS - Index pour recherches fréquentes
        Schema::table('bookings', function (Blueprint $table) {
            $table->index(['user_id', 'status'], 'bookings_user_status_idx');
            $table->index('booking_reference', 'bookings_ref_idx');
        });

        // TICKETS - Index pour validation et listing  
        Schema::table('tickets', function (Blueprint $table) {
            $table->index(['trip_id', 'status'], 'tickets_trip_status_idx');
            $table->index(['booking_id'], 'tickets_booking_idx');
        });

        // TRIPS - Index pour recherche et disponibilité
        Schema::table('trips', function (Blueprint $table) {
            $table->index(['route_id', 'departure_time'], 'trips_route_departure_idx');
            $table->index('status', 'trips_status_idx');
        });

        // TRANSACTIONS - Index pour rapports financiers
        Schema::table('transactions', function (Blueprint $table) {
            $table->index(['booking_id', 'status'], 'transactions_booking_idx');
        });

        // PRICING_RULES - Index pour calcul rapide
        Schema::table('pricing_rules', function (Blueprint $table) {
            $table->index(['route_id', 'passenger_type', 'is_active'], 'pricing_lookup_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex('bookings_user_status_idx');
            $table->dropIndex('bookings_ref_idx');
        });

        Schema::table('tickets', function (Blueprint $table) {
            $table->dropIndex('tickets_trip_status_idx');
            $table->dropIndex('tickets_booking_idx');
        });

        Schema::table('trips', function (Blueprint $table) {
            $table->dropIndex('trips_route_departure_idx');
            $table->dropIndex('trips_status_idx');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex('transactions_booking_idx');
        });

        Schema::table('pricing_rules', function (Blueprint $table) {
            $table->dropIndex('pricing_lookup_idx');
        });
    }
};
