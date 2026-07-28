<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    protected string $token;
    protected string $apiUrl;

    public function __construct()
    {
        $this->token = config('services.telegram.bot_token', env('TELEGRAM_BOT_TOKEN'));
        $this->apiUrl = "https://api.telegram.org/bot{$this->token}";
    }

    /**
     * Send a text message to a specific Telegram chat.
     */
    public function sendMessage(string $chatId, string $message, string $parseMode = 'Markdown'): bool
    {
        if (empty($this->token) || empty($chatId)) {
            Log::warning('Telegram notification skipped: Missing token or chat ID.');
            return false;
        }

        try {
            $response = Http::post("{$this->apiUrl}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => $parseMode,
                'disable_web_page_preview' => true,
            ]);

            if ($response->successful()) {
                return true;
            }

            // Handle invalid or blocked users gracefully
            $errorCode = $response->json('error_code');
            $description = $response->json('description');

            Log::error("Telegram API Error [{$errorCode}]: {$description} for chat_id: {$chatId}");

            if (in_array($errorCode, [403, 400])) {
                // User blocked bot or chat not found; consider cleaning up chat_id if needed
                Log::warning("Deactivating Telegram for chat_id {$chatId} due to delivery failure.");
            }

            return false;
        } catch (\Throwable $e) {
            Log::error("Exception occurred while sending Telegram message: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Format and send a job alert notification.
     */
    public function sendJobAlert(string $chatId, $job, string $alertKeyword): bool
    {
        $message = "🚨 *New Job Match*\n\n" .
                   "*{$job->title}*\n\n" .
                   "🏢 *Company:* " . ($job->company->name ?? 'Private/Unknown') . "\n" .
                   "📍 *Location:* {$job->location}\n" .
                   "💼 *Type:* " . ($job->employment_type ?? 'Not Specified') . "\n\n" .
                   "━━━━━━━━━━━━━━━━━━\n" .
                   "🎯 *Matched Alert:* {$alertKeyword}\n\n" .
                   "[🔗 View Job Details]({$job->url})";

        return $this->sendMessage($chatId, $message);
    }
}