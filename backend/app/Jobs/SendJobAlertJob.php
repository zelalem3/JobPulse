<?php

namespace App\Jobs;

use App\Models\JobAlert;
use App\Models\JobAlertDelivery;
use App\Models\JobListing;
use App\Services\TelegramService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class SendJobAlertJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [30, 120, 300];
    public int $timeout = 60;

    public function __construct(
        public int $alertId,
        public int $jobListingId
    ) {
        $this->onQueue('default');
    }

    public function handle(TelegramService $telegram): void
    {
        $alert = JobAlert::with('user')->find($this->alertId);
        $job   = JobListing::find($this->jobListingId);

        if (!$alert || !$job) {
            return;
        }

        $user = $alert->user;

        if (!$user || empty($user->telegram_chat_id)) {
            return;
        }

        // 🔑 KEY FIX: already notified THIS USER about THIS JOB?
        $already = JobAlertDelivery::where('job_listing_id', $job->id)
            ->whereHas('alert', fn ($q) => $q->where('user_id', $user->id))
            ->exists();

        if ($already) {
            return;
        }

        try {
            $success = $telegram->sendJobAlert(
                $user->telegram_chat_id,
                $job,
                $alert->keyword
            );

            if ($success) {
                JobAlertDelivery::create([
                    'job_alert_id'   => $alert->id,
                    'job_listing_id' => $job->id,
                    'delivered_at'   => now(),
                ]);
            }
        } catch (Throwable $e) {
            Log::error('SendJobAlertJob failed', [
                'alert_id' => $this->alertId,
                'job_id'   => $this->jobListingId,
                'error'    => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}