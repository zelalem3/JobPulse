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

class SendJobAlertJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [30, 120, 300];
    public int $timeout = 60;

    public function __construct(
        public ?int $alertId,
        public int $jobId,
        public ?string $chatIdOverride = null,
        public ?int $userId = null
    ) {
        $this->onQueue('default');
    }

    public function handle(TelegramService $telegramService): void
    {
        $job = JobListing::with('company')->find($this->jobId);

        if (!$job) {
            return;
        }

        if ($this->chatIdOverride) {
            $chatId  = $this->chatIdOverride;
            $keyword = 'Software Engineering';
            $userId  = $this->userId;
        } else {
            $alert = JobAlert::with('user')->find($this->alertId);

            if (!$alert || !$alert->user || empty($alert->user->telegram_chat_id)) {
                return;
            }

            $chatId  = $alert->user->telegram_chat_id;
            $keyword = $alert->keyword ?: 'Software Engineering';
            $userId  = $alert->user_id;
        }

        if (!$userId) {
            Log::warning('SendJobAlertJob skipped: missing user_id', [
                'job_id'   => $this->jobId,
                'alert_id' => $this->alertId,
            ]);
            return;
        }

  
        $delivery = JobAlertDelivery::firstOrCreate(
            [
                'job_listing_id' => $this->jobId,
                'user_id'        => $userId,
            ],
            [
                'job_alert_id'  => $this->alertId,
                'delivered_at'  => now(),
            ]
        );

        if (!$delivery->wasRecentlyCreated) {
            return;
        }

        $success = $telegramService->sendJobAlert($chatId, $job, $keyword);

        if (!$success) {
            
            Log::warning('Telegram send failed after claiming delivery', [
                'job_id'  => $this->jobId,
                'user_id' => $userId,
                'chat_id' => $chatId,
            ]);
        }
    }
}