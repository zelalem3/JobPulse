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
        public ?string $chatIdOverride = null,
        public ?int $userId = null
    ) {}

    public function handle(TelegramService $telegramService): void
    {
        $job = JobListing::with('company')->find($this->jobId);

        if (!$job) {
            return;
        }

        // Determine chat_id, keyword, and user_id
        if ($this->chatIdOverride) {
            $chatId  = $this->chatIdOverride;
            $keyword = 'Software Engineering';
            $userId  = $this->userId;
        } else {
            $alert = JobAlert::find($this->alertId);

            if (!$alert || !$alert->user || empty($alert->user->telegram_chat_id)) {
                return;
            }

            $chatId  = $alert->user->telegram_chat_id;
            $keyword = $alert->keyword ?? 'Software Engineering';
            $userId  = $alert->user_id;
        }

        // ✅ DEDUP: skip if already delivered to this user
        $already = JobAlertDelivery::where('job_listing_id', $this->jobId)
            ->where('user_id', $userId)
            ->exists();

        if ($already) {
            return;
        }

        $telegramService->sendJobAlert($chatId, $job, $keyword);

        JobAlertDelivery::create([
            'job_listing_id' => $this->jobId,
            'job_alert_id'   => $this->alertId,
            'user_id'        => $userId,
        ]);
    }
}   