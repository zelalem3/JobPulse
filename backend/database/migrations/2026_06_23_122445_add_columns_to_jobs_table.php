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
        // 1. Changed from Schema::table to Schema::create
        // 2. Changed table name to 'job_listings' to separate it from Laravel's queue engine
        Schema::create('job_listings', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->string('company')->nullable();
            $table->string('location')->nullable();
            $table->text('requirements')->nullable();
            $table->text('description')->nullable();
            $table->string('url')->unique();
            $table->string('source')->nullable();
            $table->timestamps(); // This safely creates clean created_at and updated_at tracking
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_listings');
    }
};