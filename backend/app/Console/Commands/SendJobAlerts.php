<?php

namespace App\Console\Commands;

use App\Jobs\SendJobAlertJob;
use App\Models\JobAlert;
use App\Models\JobAlertDelivery;
use App\Models\JobListing;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendJobAlerts extends Command
{
    protected $signature = 'job-alerts:send';
    protected $description = 'Dispatch matching job alerts to the Redis queue';

    protected array $defaultSkills = [
        'Python', 'JavaScript', 'Java', 'PHP', 'C++',
        'Django', 'Node', 'Backend', 'REST API', 'Flask',
        'Software Engineering', 'Computer Science', 'python',
        'Laravel', 'Node js', 'TypeScript', 'React',
    ];

    public function handle(): int
    {
        $this->info('Dispatching job alerts to queue...');

        $since = now()->subHours(48);
        $dispatched = 0;

        // ✅ Fetch ALL matching jobs ONCE
        $allJobs = JobListing::query()
            ->where('created_at', '>=', $since)
            ->where('is_active', true)
            ->where(function ($q) {
                foreach ($this->defaultSkills as $skill) {
                    $q->orWhere('title', 'like', "%{$skill}%")
                      ->orWhere('description', 'like', "%{$skill}%")
                      ->orWhere('requirements', 'like', "%{$skill}%");
                }
            })
            ->get();

        $this->info("Found {$allJobs->count()} matching jobs.");

        // ✅ Load ALL existing deliveries ONCE
        $existingDeliveries = JobAlertDelivery::query()
            ->with('alert')
            ->get()
            ->map(fn ($d) => $d->job_listing_id . '_' . ($d->alert->user_id ?? 0))
            ->toBase();

        // 1. Users WITH JobAlert
        $alerts = JobAlert::query()->with('user')->get();

        foreach ($alerts as $alert) {
            $user = $alert->user;

            if (!$user || empty($user->telegram_chat_id)) {
                continue;
            }

            $keyword = trim($alert->keyword ?? '');
            $userId  = $user->id;

            foreach ($allJobs as $job) {
                $key = $job->id . '_' . $userId;
                if ($existingDeliveries->contains($key)) {
                    continue;
                }

                $haystack = strtolower(
                    ($job->title ?? '') . ' ' .
                    ($job->description ?? '') . ' ' .
                    ($job->requirements ?? '')
                );

                $matches = false;

                if (!empty($keyword) && str_contains($haystack, strtolower($keyword))) {
                    $matches = true;
                }

                if (!$matches) {
                    foreach ($this->defaultSkills as $skill) {
                        if (str_contains($haystack, strtolower($skill))) {
                            $matches = true;
                            break;
                        }
                    }
                }

                if (!$matches) {
                    continue;
                }

                SendJobAlertJob::dispatch($alert->id, $job->id);
                $existingDeliveries->push($key);
                $dispatched++;
            }
        }

        // 2. Users WITHOUT JobAlert but have telegram_chat_id
        $usersWithoutAlerts = User::whereNotNull('telegram_chat_id')
            ->whereDoesntHave('jobAlerts')
            ->get();

        foreach ($usersWithoutAlerts as $user) {
            $userId = $user->id;

            foreach ($allJobs as $job) {
                $key = $job->id . '_' . $userId;
                if ($existingDeliveries->contains($key)) {
                    continue;
                }

                SendJobAlertJob::dispatch(null, $job->id, $user->telegram_chat_id);
                $existingDeliveries->push($key);
                $dispatched++;
            }
        }

        $this->info("Dispatched {$dispatched} alert jobs to Redis queue.");
        return self::SUCCESS;
    }
}   