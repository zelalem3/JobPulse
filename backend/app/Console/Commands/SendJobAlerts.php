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

        // 1. Process users who HAVE JobAlert records
        $alerts = JobAlert::query()->with('user')->get();

        if ($alerts->isNotEmpty()) {
            foreach ($alerts as $alert) {
                $user = $alert->user;

                if (!$user || empty($user->telegram_chat_id)) {
                    continue;
                }

                $jobs = $this->getMatchingJobs($alert, $since);

                foreach ($jobs as $job) {
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
        }

        // 2. Process users who have NO JobAlert but have telegram_chat_id
        $usersWithoutAlerts = User::whereNotNull('telegram_chat_id')
            ->whereDoesntHave('jobAlerts')
            ->get();

        foreach ($usersWithoutAlerts as $user) {
            $jobs = $this->getDefaultSkillJobs($since);

            foreach ($jobs as $job) {
                $already = JobAlertDelivery::where('job_listing_id', $job->id)
                    ->whereHas('alert', fn ($q) => $q->where('user_id', $user->id))
                    ->exists();

                if ($already) {
                    continue;
                }

                SendJobAlertJob::dispatch(null, $job->id, $user->telegram_chat_id);
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
            ->where('is_active', true)
            ->where(function ($q) use ($alert) {
                $keyword = trim($alert->keyword ?? '');

                foreach ($this->defaultSkills as $skill) {
                    $q->orWhere('title', 'like', "%{$skill}%")
                      ->orWhere('description', 'like', "%{$skill}%")
                      ->orWhere('requirements', 'like', "%{$skill}%");
                }

                if (!empty($keyword)) {
                    $q->orWhere('title', 'like', "%{$keyword}%")
                      ->orWhere('description', 'like', "%{$keyword}%")
                      ->orWhere('requirements', 'like', "%{$keyword}%");
                }
            });

        if (!empty($alert->location)) {
            $query->where('location', 'like', "%{$alert->location}%");
        }

        if (!empty($alert->category)) {
            $query->where('category', $alert->category);
        }

        return $query->orderByDesc('created_at')->get();
    }

    protected function getDefaultSkillJobs(Carbon $since)
    {
        return JobListing::query()
            ->where('created_at', '>=', $since)
            ->where('is_active', true)
            ->where(function ($q) {
                foreach ($this->defaultSkills as $skill) {
                    $q->orWhere('title', 'like', "%{$skill}%")
                      ->orWhere('description', 'like', "%{$skill}%")
                      ->orWhere('requirements', 'like', "%{$skill}%");
                }
            })
            ->orderByDesc('created_at')
            ->get();
    }
}   