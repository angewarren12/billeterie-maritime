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
        Schema::create('cash_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('cash_desk_id')->constrained()->onDelete('cascade');
            $table->decimal('opening_amount', 12, 2)->default(0);
            $table->decimal('expected_amount', 12, 2)->default(0); // Ventes cumulées + ouverture
            $table->decimal('closing_amount_declared', 12, 2)->nullable();
            $table->decimal('discrepancy_amount', 12, 2)->nullable(); // Écart (Expected - Declared)
            $table->string('status')->default('open'); // open, closed
            $table->text('notes')->nullable();
            $table->timestamp('opened_at')->useCurrent();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_sessions');
    }
};
