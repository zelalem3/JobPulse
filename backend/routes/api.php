<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\ApiRegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Api\JobListingController;
use App\Http\Controllers\Api\JobSearchController;

Route::prefix('auth')->group(function () {
    Route::post('/register', [ApiRegisterController::class, 'register']);
    Route::post('/login', [LoginController::class, 'login']); 
});

Route::apiResource('jobs', JobListingController::class)
    ->only(['index', 'show']);



Route::get('jobs/:id', [JobSearchController::class, 'index']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});