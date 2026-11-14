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

class SendJobAlertJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(
        public ?int $alertId,
        public int $jobId,
        public ?string $chatIdOverride = null
    ) {}

    public function handle(TelegramService $telegramService): void
    {
        $job = JobListing::find($this->jobId);

        if (!$job) {
            return;
        }

        // Determine chat_id and alert keyword
        if ($this->chatIdOverride) {
            $chatId = $this->chatIdOverride;
            $keyword = 'Software Engineering';
        } else {
            $alert = JobAlert::find($this->alertId);

            if (!$alert) {
                return;
            }

            $chatId = $alert->user->telegram_chat_id;
            $keyword = $alert->keyword ?? 'Software Engineering';

            if (empty($chatId)) {
                return;
            }
        }

        // Send the alert
        $telegramService->sendJobAlert($chatId, $job, $keyword);

        // Record delivery (only if alert exists)
        if ($this->alertId) {
            JobAlertDelivery::create([
                'job_listing_id' => $this->jobId,
                'alert_id'       => $this->alertId,
            ]);
        }
    }
}   