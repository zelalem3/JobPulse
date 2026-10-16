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
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('headline')->nullable();
            $table->text('bio')->nullable();
            $table->string('experience_level')->nullable();         
            $table->unsignedTinyInteger('years_of_experience')->nullable();
            $table->string('location')->nullable();
            $table->string('work_preference')->nullable();           
            $table->unsignedInteger('expected_salary_min')->nullable();
            $table->unsignedInteger('expected_salary_max')->nullable();
            $table->string('availability')->nullable();         
            $table->boolean('open_to_work')->default(true);
            $table->string('github_url')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('portfolio_url')->nullable();
      

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
