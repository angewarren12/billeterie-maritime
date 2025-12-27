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
        Schema::table('access_devices', function (Blueprint $table) {
            $table->foreignId('port_id')->nullable()->after('id')->constrained('ports')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('access_devices', function (Blueprint $table) {
            $table->dropForeign(['port_id']);
            $table->dropColumn('port_id');
        });
    }
};
