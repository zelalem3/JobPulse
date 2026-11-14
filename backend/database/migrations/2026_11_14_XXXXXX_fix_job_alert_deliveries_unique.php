<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop the old unique that only worked for rows with a job_alert_id
        Schema::table('job_alert_deliveries', function (Blueprint $table) {
            $table->dropUnique(['job_alert_id', 'job_listing_id']);
        });

        // Back-fill any existing rows that somehow have user_id null
        // (optional safety – adjust if you prefer to delete them instead)
        DB::statement("
            UPDATE job_alert_deliveries d
            SET user_id = a.user_id
            FROM job_alerts a
            WHERE d.job_alert_id = a.id
              AND d.user_id IS NULL
        ");

        // Make user_id required going forward and add the real unique key
        Schema::table('job_alert_deliveries', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
            $table->unique(['job_listing_id', 'user_id'], 'job_alert_deliveries_job_user_unique');
        });
    }

    public function down(): void
    {
        Schema::table('job_alert_deliveries', function (Blueprint $table) {
            $table->dropUnique('job_alert_deliveries_job_user_unique');
            $table->unsignedBigInteger('user_id')->nullable()->change();
            $table->unique(['job_alert_id', 'job_listing_id']);
        });
    }
};