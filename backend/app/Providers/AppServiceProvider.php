<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\JobListing;
use App\Observers\JobListingObserver;
use App\Console\Commands\SendDailyRecommendations;

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
        // Register model observers
        JobListing::observe(JobListingObserver::class);

        // Register console commands
        if ($this->app->runningInConsole()) {
            $this->commands([
                SendDailyRecommendations::class,
            ]);
        }
    }
}