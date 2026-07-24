<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\JobListing; 
use Carbon\Carbon;

class PurgeOldJobs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'jobs:purge-old';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete job listings older than one week';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $oneWeekAgo = Carbon::now()->subWeek();

    
        $deletedCount = JobListing::where('created_at', '<', $oneWeekAgo)->delete();

        $this->info("Successfully purged {$deletedCount} expired job listings.");
    }
}