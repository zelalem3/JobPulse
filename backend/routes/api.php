<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\ApiRegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Api\JobListingController;
use App\Http\Controllers\Api\JobSearchController;
use App\Http\Controllers\Api\SaveJobController; 
use App\Http\Controllers\Api\DashboardController;


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




Route::middleware('auth:sanctum')->group(function () {
    
    Route::get('dashboard/stats',[DashboardController::class,'stats']);
    Route::get('dashboard/topcompanies',[DashboardController::class,'topcompanies']);
    Route::get('dashboard/skills',[DashboardController::class,'skills']);
    Route::get('dashboard/graph',[DashboardController::class,'graph']);
    Route::get('savedjobs',[SaveJobController::class,'getsaved']);
   
   
    Route::post('savejob/{id}', [SaveJobController::class, 'index']);
    
   
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
});