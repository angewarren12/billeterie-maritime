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
        Schema::create('trips', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('route_id')->constrained('routes')->onDelete('cascade');
            $table->foreignId('ship_id')->constrained('ships')->onDelete('cascade');
            $table->dateTime('departure_time');
            $table->dateTime('arrival_time')->nullable();
            $table->string('status')->default('scheduled'); // scheduled, boarding, departed, cancelled, delayed
            $table->integer('available_seats_pax');
            $table->integer('available_slots_vehicles')->default(0);
            $table->timestamps();
        });

        Schema::create('pricing_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_id')->constrained('routes')->onDelete('cascade');
            $table->string('passenger_type'); // adult, child, senior
            $table->string('nationality_group'); // national, resident, african, hors_afrique
            $table->decimal('base_price', 10, 2);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pricing_rules');
        Schema::dropIfExists('trips');
    }
};
