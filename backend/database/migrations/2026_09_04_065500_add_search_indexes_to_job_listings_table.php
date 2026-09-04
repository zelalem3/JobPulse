<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Standard B-tree indexes with safety checks
        Schema::table('job_listings', function (Blueprint $table) {
            // Check if index exists before creating to prevent duplicate errors
            if (!collect(DB::select("SELECT indexname FROM pg_indexes WHERE tablename = 'job_listings'"))->contains('indexname', 'job_listings_location_index')) {
                $table->index('location');
            }
            if (!collect(DB::select("SELECT indexname FROM pg_indexes WHERE tablename = 'job_listings'"))->contains('indexname', 'job_listings_source_index')) {
                $table->index('source');
            }
            if (!collect(DB::select("SELECT indexname FROM pg_indexes WHERE tablename = 'job_listings'"))->contains('indexname', 'job_listings_posted_at_index')) {
                $table->index('posted_at');
            }
        });

        // 2. PostgreSQL GIN Index for full-text search (safe with IF NOT EXISTS)
        DB::statement('CREATE INDEX IF NOT EXISTS job_listings_search_gin_idx ON job_listings USING gin (to_tsvector(\'english\', coalesce(title,\'\') || \' \' || coalesce(description,\'\')));');
    }

    public function down(): void
    {
        Schema::table('job_listings', function (Blueprint $table) {
            $table->dropIndex(['location']);
            $table->dropIndex(['source']);
            $table->dropIndex(['posted_at']);
        });

        DB::statement('DROP INDEX IF EXISTS job_listings_search_gin_idx;');
    }
};