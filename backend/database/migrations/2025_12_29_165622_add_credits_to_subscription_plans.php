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
        Schema::table('subscription_plans', function (Blueprint $table) {
            $table->integer('voyage_credits')->default(0)->after('price')
                ->comment('Nombre de crédits voyage inclus dans le plan');
            
            $table->enum('credit_type', ['unlimited', 'counted'])->default('counted')->after('voyage_credits')
                ->comment('unlimited = illimité pendant la durée, counted = nombre fixe de crédits');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscription_plans', function (Blueprint $table) {
            $table->dropColumn(['voyage_credits', 'credit_type']);
        });
    }
};
