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
        Schema::table('bookings', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('status');
            $table->index('created_at');
        });

        Schema::table('tickets', function (Blueprint $table) {
            $table->index('booking_id');
            $table->index('trip_id');
            $table->index('status');
        });

        Schema::table('trips', function (Blueprint $table) {
            $table->index('departure_time');
            $table->index('status');
            $table->index('available_seats_pax');
        });

        Schema::table('pricing_rules', function (Blueprint $table) {
            $table->index(['route_id', 'passenger_type', 'nationality_group'], 'idx_pricing_lookup');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('tickets', function (Blueprint $table) {
            $table->dropIndex(['booking_id']);
            $table->dropIndex(['trip_id']);
            $table->dropIndex(['status']);
        });

        Schema::table('trips', function (Blueprint $table) {
            $table->dropIndex(['departure_time']);
            $table->dropIndex(['status']);
            $table->dropIndex(['available_seats_pax']);
        });

        Schema::table('pricing_rules', function (Blueprint $table) {
            $table->dropIndex('idx_pricing_lookup');
        });
    }
};
