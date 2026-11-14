<?php

namespace App\Services;

use App\Models\TelegramMessage;
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

    public function sendMessage(string $chatId, string $message, ?string $parseMode = null): bool
    {
        if (empty($this->token) || empty($chatId)) {
            Log::warning('Telegram notification skipped: Missing token or chat ID.');
            return false;
        }

        try {
            $payload = [
                'chat_id' => $chatId,
                'text' => $message,
                'disable_web_page_preview' => true,
            ];

            if ($parseMode) {
                $payload['parse_mode'] = $parseMode;
            }

            $response = Http::post("{$this->apiUrl}/sendMessage", $payload);

            if ($response->successful()) {
                // ✅ LOG OUTGOING MESSAGE
                TelegramMessage::create([
                    'chat_id'   => $chatId,
                    'direction' => 'out',
                    'content'   => strip_tags($message),
                    'sent_at'   => now(),
                ]);

                return true;
            }

            $errorCode = $response->json('error_code');
            $description = $response->json('description');

            Log::error("Telegram API Error [{$errorCode}]: {$description} for chat_id: {$chatId}");

            if (in_array($errorCode, [403, 400])) {
                Log::warning("Deactivating Telegram for chat_id {$chatId} due to delivery failure.");

                \App\Models\User::where('telegram_chat_id', $chatId)->update([
                    'telegram_chat_id'      => null,
                    'telegram_username'     => null,
                    'telegram_connected_at' => null,
                ]);
            }

            return false;
        } catch (\Throwable $e) {
            Log::error("Exception occurred while sending Telegram message: " . $e->getMessage());
            return false;
        }
    }

    public function sendJobAlert(string $chatId, $job, string $alertKeyword): bool
    {
        $title = htmlspecialchars($job->title ?? 'Untitled', ENT_QUOTES, 'UTF-8');
        $company = htmlspecialchars($job->company->name ?? 'Private/Unknown', ENT_QUOTES, 'UTF-8');
        $location = htmlspecialchars($job->location ?? 'Remote/Not Specified', ENT_QUOTES, 'UTF-8');
        $employmentType = htmlspecialchars($job->employment_type ?? 'Not Specified', ENT_QUOTES, 'UTF-8');
        $keyword = htmlspecialchars($alertKeyword, ENT_QUOTES, 'UTF-8');
        $jobUrl = $job->url ?? '#';

        $message = "🚨 <b>New Job Match</b>\n\n" .
                   "<b>{$title}</b>\n\n" .
                   "🏢 <b>Company:</b> {$company}\n" .
                   "📍 <b>Location:</b> {$location}\n" .
                   "💼 <b>Type:</b> {$employmentType}\n\n" .
                   "━━━━━━━━━━━━━━━━━━\n" .
                   
                   "<a href=\"{$jobUrl}\">🔗 View Job Details</a>";

        return $this->sendMessage($chatId, $message, 'HTML');
    }
}   