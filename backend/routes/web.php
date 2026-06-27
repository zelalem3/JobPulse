<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});
Route::get('/test-mail', function () {
    Mail::raw('Hello from JobPulse!', function ($message) {
        $message->to('test@example.com')
                ->subject('Test Email');
    });

    return 'Email sent!';
});

require __DIR__.'/auth.php';
