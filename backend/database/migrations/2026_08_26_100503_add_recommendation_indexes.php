<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
         * ------------------------------------------------------
         * job_skill
         * ------------------------------------------------------
         */

        Schema::table('job_skill', function (Blueprint $table) {
            $table->index(
                ['skill_id', 'job_listing_id'],
                'job_skill_skill_job_index'
            );
        });

        /*
         * ------------------------------------------------------
         * skill_user
         * ------------------------------------------------------
         */

        Schema::table('skill_user', function (Blueprint $table) {
            $table->index(
                ['skill_id', 'user_id'],
                'skill_user_skill_user_index'
            );
        });

        /*
         * ------------------------------------------------------
         * job_listings
         * ------------------------------------------------------
         */

        Schema::table('job_listings', function (Blueprint $table) {
            $table->index(
                ['is_active', 'posted_at'],
                'job_listings_active_posted_index'
            );

            $table->index(
                ['is_active', 'deadline'],
                'job_listings_active_deadline_index'
            );

            $table->index(
                'quality_score',
                'job_listings_quality_index'
            );
        });
    }

    public function down(): void
    {
        Schema::table('job_skill', function (Blueprint $table) {
            $table->dropIndex(
                'job_skill_skill_job_index'
            );
        });

        Schema::table('skill_user', function (Blueprint $table) {
            $table->dropIndex(
                'skill_user_skill_user_index'
            );
        });

        Schema::table('job_listings', function (Blueprint $table) {
            $table->dropIndex(
                'job_listings_active_posted_index'
            );

            $table->dropIndex(
                'job_listings_active_deadline_index'
            );

            $table->dropIndex(
                'job_listings_quality_index'
            );
        });
    }
};