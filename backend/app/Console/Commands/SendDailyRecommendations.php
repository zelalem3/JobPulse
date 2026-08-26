<?php
 
namespace App\Console\Commands;

use App\Models\User;
use App\Jobs\SendUserRecommendationJob;
use Illuminate\Console\Command;

class SendDailyRecommendations extends Command
{
    protected $signature = 'recommendations:send';
    protected $description = 'Dispatch recommendation emails for all users';

    public function handle()
    {
        $this->info('Dispatching recommendation jobs...');

        User::query()->select(['id', 'email', 'location'])->chunkById(500, function ($users) {
            foreach ($users as $user) {
                SendUserRecommendationJob::dispatch($user);
            }
        });

        $this->info('All recommendation jobs have been dispatched to the queue!');
    }
}