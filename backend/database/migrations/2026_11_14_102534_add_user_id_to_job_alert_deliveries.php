<?php

namespace Database\Migrations;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE job_alert_deliveries ALTER COLUMN job_alert_id DROP NOT NULL');

        Schema::table('job_alert_deliveries', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->after('job_alert_id')->index();
        });
    }

    public function down(): void
    {
        Schema::table('job_alert_deliveries', function (Blueprint $table) {
            $table->dropColumn('user_id');
        });

        DB::statement('ALTER TABLE job_alert_deliveries ALTER COLUMN job_alert_id SET NOT NULL');
    }
};   