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
        Schema::table('subscriptions', function (Blueprint $table) {
            // Renommer current_credit en legacy_credit_fcfa pour compatibilité
            $table->renameColumn('current_credit', 'legacy_credit_fcfa');
            
            // Ajouter les nouveaux champs pour le système de crédits voyage
            $table->integer('voyage_credits_initial')->default(0)->after('legacy_credit_fcfa')
                ->comment('Nombre de crédits voyage au départ');
            
            $table->integer('voyage_credits_remaining')->default(0)->after('voyage_credits_initial')
                ->comment('Nombre de crédits voyage restants');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->renameColumn('legacy_credit_fcfa', 'current_credit');
            $table->dropColumn(['voyage_credits_initial', 'voyage_credits_remaining']);
        });
    }
};
