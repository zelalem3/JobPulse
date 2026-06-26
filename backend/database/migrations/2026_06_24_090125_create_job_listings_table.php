<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_listings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('company_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->string('title');
            $table->string('location')->nullable();

            $table->text('requirements')->nullable();
            $table->longText('description')->nullable();

            $table->string('employment_type')->nullable();
            $table->string('experience_level')->nullable();
            $table->string('salary')->nullable();
            $table->string('category')->nullable();

            $table->json('skills')->nullable();

            $table->date('deadline')->nullable();
            $table->timestamp('posted_at')->nullable();

            $table->string('source')->nullable();
            $table->string('url')->unique();
            $table->longText('responsibilities')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index('title');
            $table->index('location');
            $table->index('source');
            $table->index('deadline');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_listings');
    }
};