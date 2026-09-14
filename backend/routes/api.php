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
| Protected Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Profile
    Route::get('profile', [ProfileController::class, 'show']);
    Route::put('profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    // Job Search
    Route::get('/jobs/search', [JobSearchController::class, 'search']);

    // Job Filters
    Route::get('/jobs/filters', [JobListingController::class, 'filters']);

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
    Route::get('savedjobs', [SaveJobController::class, 'index']);
    Route::post('savejob/{id}', [SaveJobController::class, 'store']);
    Route::delete('savejob/{id}', [SaveJobController::class, 'destroy']);

    // Alerts
    Route::get('alerts', [AlertController::class, 'index']);
    Route::post('alerts', [AlertController::class, 'store']);
    Route::delete('alerts/{id}', [AlertController::class, 'destroy']);

    // Recommendations
    Route::get('/recommendations', [RecommendationController::class, 'index']);

    // Job Alerts
    Route::get('job-alerts', [AlertController::class, 'index']);
    Route::post('job-alerts', [AlertController::class, 'create']);
    Route::put('job-alerts/{id}', [AlertController::class, 'update']);
    Route::delete('job-alerts/{id}', [AlertController::class, 'destroy']);

    // Job Recommendation
    Route::get(
        '/job/recommendation/{job}',
        [RecommendationController::class, 'getRecommendation']
    );
});


/*
|--------------------------------------------------------------------------
| Public Job Routes
|--------------------------------------------------------------------------
*/



Route::get('/jobs/filters', [JobListingController::class, 'filters']);
Route::get('/jobs/search', [JobSearchController::class, 'search']);

Route::apiResource('jobs', JobListingController::class)
    ->only(['index', 'show']);