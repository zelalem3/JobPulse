<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_listings', function (Blueprint $table) {

            $table->unsignedTinyInteger('quality_score')
                  ->default(0)
                  ->after('skills');

        });
    }

    public function down(): void
    {
        Schema::table('job_listings', function (Blueprint $table) {

            $table->dropColumn('quality_score');

        });
    }
};