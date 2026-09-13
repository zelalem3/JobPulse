
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

use App\Http\Controllers\Auth\ApiRegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Api\JobListingController;
use App\Http\Controllers\Api\JobSearchController;
use App\Http\Controllers\Api\SaveJobController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\RecommendationController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\TelegramWebhookController;
use App\Http\Controllers\Api\TelegramController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Authentication
Route::post('/auth/register', [ApiRegisterController::class, 'register']);
Route::post('/auth/login', [LoginController::class, 'login']);

// Public jobs
Route::get('/jobs/filters', [JobListingController::class, 'filters']);
Route::get('/jobs/search', [JobSearchController::class, 'search']);

Route::apiResource('jobs', JobListingController::class)
    ->only(['index', 'show']);

/*
|--------------------------------------------------------------------------
| Telegram Webhook
|--------------------------------------------------------------------------
*/

// Keep this route public.
// Telegram cannot send your Sanctum user token.
Route::post('/telegram/webhook', [TelegramWebhookController::class, 'handle']);

/*
|--------------------------------------------------------------------------
| Purge Old Jobs
|--------------------------------------------------------------------------
*/

Route::get('/purgejobs', function (Request $request) {

    if (
        !$request->hasValidSignature()
        && $request->query('token') !== env('CRON_SECRET_TOKEN')
    ) {
        return response()->json([
            'error' => 'Unauthorized',
        ], 401);
    }

    Artisan::call('jobs:purge-old');

    return response()->json([
        'status' => 'Old Jobs Purged',
        'output' => Artisan::output(),
    ]);
});

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [LoginController::class, 'logout']);

    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    // Job Search
    // Public search is already defined above.

    // Telegram
    Route::post('/telegram/connect', [TelegramController::class, 'connect']);
    Route::delete('/telegram/disconnect', [TelegramController::class, 'disconnect']);
    Route::get('/telegram/status', [TelegramController::class, 'status']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/graph', [DashboardController::class, 'graph']);
    Route::get('/dashboard/skills', [DashboardController::class, 'skills']);
    Route::get('/dashboard/topcompanies', [DashboardController::class, 'topcompanies']);

    // Saved Jobs
    Route::get('/savedjobs', [SaveJobController::class, 'index']);
    Route::post('/savejob/{id}', [SaveJobController::class, 'store']);
    Route::delete('/savejob/{id}', [SaveJobController::class, 'destroy']);

    // Alerts
    Route::get('/alerts', [AlertController::class, 'index']);
    Route::post('/alerts', [AlertController::class, 'store']);
    Route::delete('/alerts/{id}', [AlertController::class, 'destroy']);

    // Job Alerts
    Route::get('/job-alerts', [AlertController::class, 'index']);
    Route::post('/job-alerts', [AlertController::class, 'create']);
    Route::put('/job-alerts/{id}', [AlertController::class, 'update']);
    Route::delete('/job-alerts/{id}', [AlertController::class, 'destroy']);

    // Recommendations
    Route::get('/recommendations', [RecommendationController::class, 'index']);

    Route::get(
        '/job/recommendation/{job}',
        [RecommendationController::class, 'getRecommendation']
    );
});