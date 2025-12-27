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
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('price', 10, 2);
            $table->integer('duration_days');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('plan_id')->constrained('subscription_plans')->onDelete('cascade');
            $table->string('rfid_card_id')->nullable()->unique();
            $table->date('start_date');
            $table->date('end_date');
            $table->string('status')->default('active'); // active, expired, blocked
            $table->decimal('current_credit', 10, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('access_devices', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('location');
            $table->string('type'); // tripod, pda, handheld
            $table->string('device_identifier')->unique();
            $table->timestamps();
        });

        Schema::create('access_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('ticket_id')->nullable()->constrained('tickets')->onDelete('set null');
            $table->foreignUuid('subscription_id')->nullable()->constrained('subscriptions')->onDelete('set null');
            $table->foreignId('device_id')->constrained('access_devices')->onDelete('cascade');
            $table->string('direction'); // entry, exit
            $table->string('result'); // granted, denied
            $table->string('deny_reason')->nullable();
            $table->timestamp('scanned_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('access_logs');
        Schema::dropIfExists('access_devices');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('subscription_plans');
    }
};
