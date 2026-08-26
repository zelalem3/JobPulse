<?php

namespace App\Console\Commands;

use App\Jobs\SendUserRecommendationJob;
use App\Models\User;
use Illuminate\Console\Command;

class SendDailyRecommendations extends Command
{
    protected $signature = 'recommendations:send';

    protected $description = 'Dispatch daily recommendation jobs for all users';

    public function handle(): int
    {
        $this->info('Dispatching recommendation jobs...');

        $dispatched = 0;

        User::query()
            ->select(['id'])
            ->whereNotNull('email')
            ->chunkById(500, function ($users) use (&$dispatched) {
                foreach ($users as $user) {
                    SendUserRecommendationJob::dispatch($user->id);

                    $dispatched++;
                }

                $this->info(
                    "Dispatched {$dispatched} recommendation jobs..."
                );
            });

        $this->newLine();

        $this->info(
            "All recommendation jobs have been dispatched: {$dispatched}"
        );

        return self::SUCCESS;
    }
}