<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\ApiRegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Api\JobListingController;
use App\Http\Controllers\Api\JobSearchController;
use App\Http\Controllers\Api\SaveJobController; 
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AlertController;
use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\Api\RecommendationController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\TelegramWebhookController;
use App\Http\Controllers\Api\TelegramController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
| Anyone can access these routes without logging in.
*/
Route::get('/cron/run', function (\Illuminate\Http\Request $request) {
    $secretToken = config('services.cron.token', env('CRON_SECRET_TOKEN'));
    
    if ($secretToken && $request->query('token') !== $secretToken) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    Artisan::call('alerts:send');

    return response()->json([
        'status' => 'success',
        'message' => 'Job alerts processed successfully.',
        'output' => Artisan::output()
    ]);
});


Route::get('/prugejobs', function (Request $request) {
    if ($request->query('token') !== env('CRON_SECRET_TOKEN')) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }
    
    Artisan::call('jobs:purge-old');

    return response()->json([
        'status' => 'Old Jobs Purged',
        'output' => Artisan::output(),
    ]);
});

Route::post('/telegram/webhook', [TelegramWebhookController::class, 'handle']);

Route::get('/ping', function () {
    return response()->json(['status' => 'alive']);
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [ApiRegisterController::class, 'register']);
    Route::post('/login', [LoginController::class, 'login']); 
});

Route::get('/trigger-daily-recommendations', function (Request $request) {
    if ($request->query('token') !== env('CRON_SECRET_TOKEN')) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    Artisan::call('recommendations:send');

    return response()->json([
        'status' => 'Recommendation emails triggered successfully!',
        'output' => Artisan::output()
    ]);
});

// ✅ Fixed: Removed the conflicting JobSearchController route override so api/jobs works cleanly
Route::apiResource('jobs', JobListingController::class)->only(['index', 'show']);

Route::get('/test-mail', function () {
    Mail::raw('Hello from JobPulse!', function ($message) {
        $message->to('test@example.com')
                ->subject('Test Email');
    });
    return 'Email sent!';
});

/*
|--------------------------------------------------------------------------
| Protected Routes (Sanctum Authenticated)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    //--- Profile Routes---
    Route::get('profile', [ProfileController::class, 'show']);
    Route::put('profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    //-- Job Search ---
    Route::get('search', [SearchController::class, '__invoke']);

    //---Telegram Notification ---
    Route::post('/telegram/connect', [TelegramController::class, 'connect']);
    Route::delete('/telegram/disconnect', [TelegramController::class, 'disconnect']);
    Route::get('/telegram/status', [TelegramController::class, 'status']);
    
    // --- Dashboard Routes ---
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/graph', [DashboardController::class, 'graph']);
    Route::get('/dashboard/skills', [DashboardController::class, 'skills']);
    Route::get('/dashboard/topcompanies', [DashboardController::class, 'topcompanies']);
    
    // --- Saved Jobs ---
    Route::get('savedjobs', [SaveJobController::class, 'index']);
    Route::post('savejob/{id}', [SaveJobController::class, 'store']);
    Route::delete('savejob/{id}', [SaveJobController::class, 'destroy']);
    
    // --- Job Scraper Alerts  ---
    Route::get('alerts', [AlertController::class, 'index']);      
    Route::post('alerts', [AlertController::class, 'store']);     
    Route::delete('alerts/{id}', [AlertController::class, 'destroy']); 

    //--- Job Recommendations ---
    Route::get('/recommendations', [RecommendationController::class, 'index']);
    
    // --- Job Alerts ---
    Route::get('job-alerts', [AlertController::class, 'index']);
    Route::post('job-alerts', [AlertController::class, 'create']);
    Route::put('job-alerts/{id}', [AlertController::class, 'update']);
    Route::delete('job-alerts/{id}', [AlertController::class, 'destroy']);
});