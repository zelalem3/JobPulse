<?php

namespace App\Console\Commands;

use App\Jobs\SendJobAlertJob;
use App\Models\JobAlert;
use App\Models\JobAlertDelivery;
use App\Models\JobListing;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendJobAlerts extends Command
{
    protected $signature = 'job-alerts:send';
    protected $description = 'Dispatch matching job alerts to the Redis queue';

    public function handle(): int
    {
        $this->info('Dispatching job alerts to queue...');

        $since = now()->subHours(48);

        $alerts = JobAlert::query()
            ->where('telegram_enabled', true)
            ->with('user')
            ->get();

        if ($alerts->isEmpty()) {
            $this->info('No Telegram-enabled alerts found.');
            return self::SUCCESS;
        }

        $dispatched = 0;

        foreach ($alerts as $alert) {
            $user = $alert->user;

            if (!$user || empty($user->telegram_chat_id)) {
                continue;
            }

            $jobs = $this->getMatchingJobs($alert, $since);

            foreach ($jobs as $job) {
                // Optional but recommended: skip if this user already received this job
                $already = JobAlertDelivery::where('job_listing_id', $job->id)
                    ->whereHas('alert', fn ($q) => $q->where('user_id', $user->id))
                    ->exists();

                if ($already) {
                    continue;
                }

                SendJobAlertJob::dispatch($alert->id, $job->id);
                $dispatched++;
            }
        }

        $this->info("Dispatched {$dispatched} alert jobs to Redis queue.");
        return self::SUCCESS;
    }

    protected function getMatchingJobs(JobAlert $alert, Carbon $since)
    {
        $query = JobListing::query()
            ->where('created_at', '>=', $since)
            ->where('is_active', true);

        if (!empty($alert->keyword)) {
            $keyword = trim($alert->keyword);
            $query->where(function ($q) use ($keyword) {
                $q->where('title', 'like', "%{$keyword}%")
                  ->orWhere('description', 'like', "%{$keyword}%")
                  ->orWhere('requirements', 'like', "%{$keyword}%");
            });
        }

        if (!empty($alert->location)) {
            $query->where('location', 'like', "%{$alert->location}%");
        }

        if (!empty($alert->category)) {
            $query->where('category', $alert->category);
        }

        return $query->orderByDesc('created_at')->get();
    }
}