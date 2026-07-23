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

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
| Anyone can access these routes without logging in.
*/

Route::prefix('auth')->group(function () {
    Route::post('/register', [ApiRegisterController::class, 'register']);
    Route::post('/login', [LoginController::class, 'login']); 
});

Route::apiResource('jobs', JobListingController::class)->only(['index', 'show']);
Route::get('jobs/{id}', [JobSearchController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Sanctum Authenticated)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    // --- Dashboard Routes ---
    Route::get('dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('dashboard/topcompanies', [DashboardController::class, 'topcompanies']);
    Route::get('dashboard/skills', [DashboardController::class, 'skills']);
    Route::get('dashboard/graph', [DashboardController::class, 'graph']);
    
    // --- Saved Jobs ---
    Route::get('savedjobs', [SaveJobController::class, 'index']);
    Route::post('savejob/{id}', [SaveJobController::class, 'store']);
    Route::delete('savejob/{id}',[SaveJobController::class, 'destroy']);
    
    // --- Job Scraper Alerts  ---
    Route::middleware('auth:sanctum')->group(function () {
    Route::get('alerts', [AlertController::class, 'index']);      // Fetches user's skills
    Route::post('alerts', [AlertController::class, 'store']);     // Adds a skill to user
    Route::delete('alerts/{id}', [AlertController::class, 'destroy']); // Removes a skill from user
});

    //--- Job Recommendations ---
    Route::get('/recommendations', [RecommendationController::class, 'index']);
    
    // --- Job Alerts ---
    Route::get('job-alerts', [AlertController::class, 'index']);
    Route::post('job-alerts', [AlertController::class, 'create']);
    Route::put('job-alerts/{id}', [AlertController::class, 'update']);
    Route::delete('job-alerts/{id}', [AlertController::class, 'destroy']);

    // --- Testing Routes ---
    Route::get('/test-mail', function () {
        Mail::raw('Hello from JobPulse!', function ($message) {
            $message->to('test@example.com')
                    ->subject('Test Email');
        });
        return 'Email sent!';
    });

    // --- User Profile ---
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
});