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
    Schema::table('job_alerts', function (Blueprint $table) {
        $table->string('category')->nullable()->after('location');
        $table->boolean('email_enabled')->default(true)->after('category');
        $table->boolean('telegram_enabled')->default(false)->after('email_enabled');
        $table->timestamp('last_checked_at')->nullable()->after('telegram_enabled');
    });
}
    public function down(): void
{
    Schema::table('job_alerts', function (Blueprint $table) {
        $table->dropColumn([
            'category',
            'email_enabled',
            'telegram_enabled',
            'last_checked_at',
        ]);
    });
}
};
