<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = ['location', 'bio', 'github_url', 'linkedin_url', 'resume'];

            $existing = array_values(array_filter($columns, fn ($col) => Schema::hasColumn('users', $col)));

            if (!empty($existing)) {
                $table->dropColumn($existing);
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'location')) {
                $table->string('location')->nullable();
            }
            if (!Schema::hasColumn('users', 'bio')) {
                $table->text('bio')->nullable();
            }
            if (!Schema::hasColumn('users', 'github_url')) {
                $table->string('github_url')->nullable();
            }
            if (!Schema::hasColumn('users', 'linkedin_url')) {
                $table->string('linkedin_url')->nullable();
            }
            if (!Schema::hasColumn('users', 'resume')) {
                $table->string('resume')->nullable();
            }
        });
    }

    
};
