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
        Schema::create('ports', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code', 3)->unique();
            $table->string('city');
            $table->string('country');
            $table->timestamps();
        });

        Schema::create('ships', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('company')->nullable();
            $table->string('type')->default('ferry');
            $table->integer('capacity_pax');
            $table->integer('capacity_vehicles')->default(0);
            $table->integer('capacity_freight')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('routes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('departure_port_id')->constrained('ports')->onDelete('cascade');
            $table->foreignId('arrival_port_id')->constrained('ports')->onDelete('cascade');
            $table->integer('duration_minutes');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('routes');
        Schema::dropIfExists('ships');
        Schema::dropIfExists('ports');
    }
};
