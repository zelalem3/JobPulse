<?php

namespace App\Console\Commands;

use App\Models\JobAlert;
use App\Models\JobAlertDelivery;
use App\Models\JobListing;
use App\Services\TelegramService; // change if your service has a different name/path
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SendJobAlerts extends Command
{
    protected $signature = 'job-alerts:send';
    protected $description = 'Send matching job alerts to users via Telegram (with delivery tracking)';

    public function handle(): int
    {
        $this->info('Starting job alert delivery...');

        // Look back a reasonable window (last 48 hours)
        $since = now()->subHours(48);

        $alerts = JobAlert::query()
            ->where('telegram_enabled', true)
            ->with('user')
            ->get();

        if ($alerts->isEmpty()) {
            $this->info('No Telegram-enabled alerts found.');
            return self::SUCCESS;
        }

        $sentCount = 0;
        $skippedCount = 0;

        foreach ($alerts as $alert) {
            $user = $alert->user;

            // Skip if user has no Telegram chat id
            if (!$user || empty($user->telegram_chat_id)) {
                $this->warn("Alert #{$alert->id} skipped – user has no telegram_chat_id");
                continue;
            }

            $jobs = $this->getMatchingJobs($alert, $since);

            foreach ($jobs as $job) {
                // Already delivered for this alert + job?
                $alreadyDelivered = JobAlertDelivery::where('job_alert_id', $alert->id)
                    ->where('job_listing_id', $job->id)
                    ->exists();

                if ($alreadyDelivered) {
                    $skippedCount++;
                    continue;
                }

                try {
                    $message = $this->buildMessage($job);

                    $success = app(TelegramService::class)
                        ->sendMessage($user->telegram_chat_id, $message);

                    if ($success) {
                        JobAlertDelivery::create([
                            'job_alert_id'   => $alert->id,
                            'job_listing_id' => $job->id,
                            'delivered_at'   => now(),
                        ]);

                        $sentCount++;
                        $this->line("✓ Sent job #{$job->id} to alert #{$alert->id} (user {$user->id})");
                    } else {
                        $this->warn("✗ Failed to send job #{$job->id} to alert #{$alert->id}");
                    }
                } catch (\Throwable $e) {
                    Log::error('Job alert send failed', [
                        'alert_id' => $alert->id,
                        'job_id'   => $job->id,
                        'error'    => $e->getMessage(),
                    ]);
                    $this->error("Error sending job #{$job->id}: " . $e->getMessage());
                }
            }
        }

        $this->info("Done. Sent: {$sentCount} | Skipped (already delivered): {$skippedCount}");
        return self::SUCCESS;
    }

    protected function getMatchingJobs(JobAlert $alert, Carbon $since)
    {
        $query = JobListing::query()
            ->where('created_at', '>=', $since)
            ->where('is_active', true);

        // Keyword filter (column is singular: keyword)
        if (!empty($alert->keyword)) {
            $keyword = trim($alert->keyword);
            $query->where(function ($q) use ($keyword) {
                $q->where('title', 'like', "%{$keyword}%")
                  ->orWhere('description', 'like', "%{$keyword}%")
                  ->orWhere('requirements', 'like', "%{$keyword}%");
            });
        }

        // Location filter
        if (!empty($alert->location)) {
            $query->where('location', 'like', "%{$alert->location}%");
        }

        // Category filter
        if (!empty($alert->category)) {
            $query->where('category', $alert->category);
        }

        return $query->orderByDesc('created_at')->get();
    }

   protected function buildMessage(JobListing $job): string
    {
        $title    = $this->escapeMarkdown($job->title ?? 'Untitled Job');
        $location = $this->escapeMarkdown($job->location ?? 'Remote / Not specified');
        $url      =$job->url ?? '#';
        $salary   =$job->salary ? $this->escapeMarkdown($job->salary) : null;
        $type     =$job->employment_type ? $this->escapeMarkdown($job->employment_type) : null;

        $message  = "🔔 *New Job Match*\n\n";
        $message .= "*{$title}*\n";
        $message .= "📍 {$location}\n";

        if ($type) {
            $message .= "💼 {$type}\n";
        }

        if ($salary) {
            $message .= "💰 {$salary}\n";
        }

        $message .= "\n[Apply / View Job]({$url})";

        return $message;
    }

    /**
     * Helper to escape special characters for Telegram Markdown parsing.
     */
    protected function escapeMarkdown(string $string): string
    {
        // Escaping common markdown characters that might break Telegram formatting
        return str_replace(['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'], [
            '\_', '\*', '\[', '\]', '\(', '\)', '\~', '\`', '\>', '\#', '\+', '\-', '\=', '\|', '\{', '\}', '\.', '\!'
        ], $string);
    }
}
