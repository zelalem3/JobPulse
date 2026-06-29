<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
      Schema::create('job_skill', function (Blueprint $table) {
    $table->id();

    $table->foreignId('job_listing_id')
        ->constrained('job_listings')
        ->cascadeOnDelete();

    $table->foreignId('skill_id')
        ->constrained()
        ->cascadeOnDelete();

    $table->timestamps();

    $table->unique([
        'job_listing_id',
        'skill_id'
    ]);
});
    }

    public function down(): void
    {
        Schema::dropIfExists('job_skill');
    }
};