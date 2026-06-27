<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\JobListing;
use App\Observers\JobListingObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        
        JobListing::observe(JobListingObserver::class);
    }
}