<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Schedule::command('recommendations:send')->dailyAt('08:00');
Schedule::command('queue:work --stop-when-empty')->everyMinute();


Schedule::command('jobs:purge-old')->daily();

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
