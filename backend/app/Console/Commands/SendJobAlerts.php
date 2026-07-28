<?php

namespace App\Console\Commands;

use App\Models\JobAlert;
use App\Models\JobListing;
use App\Services\TelegramService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class SendJobAlerts extends Command
{
    protected $signature = 'alerts:send';
    protected $description = 'Process user job alerts and send matching notifications via Email and Telegram';

    public function handle(TelegramService $telegramService)
    {
        $this->info('Processing active job alerts...');

        $alerts = JobAlert::with('user')->get();
        $processedCount = 0;

        foreach ($alerts as $alert) {
            $user = $alert->user;

            if (!$user) {
                continue;
            }

            // Query listings posted since the last check time, or default to last 24 hours
            $lastChecked = $alert->last_checked_at ?? Carbon::now()->subDay();

            $query = JobListing::query()->where('posted_at', '>=', $lastChecked);

            if (!empty($alert->keyword)) {
                $query->where(function($q) use ($alert) {
                    $q->where('title', 'like', "%{$alert->keyword}%")
                      ->orWhere('description', 'like', "%{$alert->keyword}%");
                });
            }

            if (!empty($alert->location)) {
                $query->where('location', 'like', "%{$alert->location}%");
            }

            if (!empty($alert->category)) {
                $query->where('category', $alert->category);
            }

            $matchingJobs = $query->get();

            if ($matchingJobs->isNotEmpty()) {
                foreach ($matchingJobs as $job) {
                    // Send Telegram notification if enabled and chat ID exists
                    if ($alert->telegram_enabled && !empty($user->telegram_chat_id)) {
                        $sent = $telegramService->sendJobAlert($user->telegram_chat_id, $job, $alert->keyword);
                        if ($sent) {
                            $this->info("✔ Telegram alert sent to user ID {$user->id} for job: {$job->title}");
                        }
                    }

                
                }
            }

            // Update last checked timestamp
            $alert->update(['last_checked_at' => Carbon::now()]);
            $processedCount++;
        }

        $this->info("Finished processing {$processedCount} alerts.");
    }
}