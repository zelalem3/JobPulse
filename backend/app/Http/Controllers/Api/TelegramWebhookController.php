<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TelegramWebhookController extends Controller
{
    protected TelegramService $telegramService;

    public function __construct(TelegramService $telegramService)
    {
        $this->telegramService = $telegramService;
    }

    public function handle(Request $request)
    {
        $update = $request->all();

        // Ensure it's a message update
        if (!isset($update['message'])) {
            return response()->json(['status' => 'ignored']);
        }

        $message = $update['message'];
        $chatId = $message['chat']['id'] ?? null;
        $text = trim($message['text'] ?? '');
        $username = $message['from']['username'] ?? null;
        $firstName = $message['from']['first_name'] ?? 'User';

        if (!$chatId) {
            return response()->json(['status' => 'no_chat_id']);
        }

        // Handle commands
        if (str_starts_with($text, '/')) {
            $this->handleCommand($chatId, $text, $username, $firstName);
        } else {
            $this->telegramService->sendMessage(
                $chatId, 
                "Hi {$firstName}! Use /start to connect your JobPulse account or /status to check your connection."
            );
        }

        return response()->json(['status' => 'success']);
    }

    protected function handleCommand(string $chatId, string $text, ?string $username, string $firstName)
    {
        // Commands might have parameters, e.g., /start TOKEN_OR_EMAIL
        $parts = explode(' ', $text);
        $command = $parts[0];

        switch ($command) {
            case '/start':
                // Check if they passed a verification token/email to auto-link
                if (isset($parts[1])) {
                    $identifier = $parts[1];
                    \Illuminate\Support\Facades\Log::info("Attempting to link telegram chat {$chatId} to identifier: {$identifier}");
                    
                    $user = User::where('email', $identifier)->orWhere('id', $identifier)->first();

                    if ($user) {
                        \Illuminate\Support\Facades\Log::info("User found: {$user->email}. Updating telegram fields.");
                        $user->update([
                            'telegram_chat_id' => $chatId,
                            'telegram_username' => $username,
                            'telegram_connected_at' => now(),
                        ]);

                        $this->telegramService->sendMessage(
                            $chatId, 
                            "✅ Success, *{$firstName}*! Your JobPulse account ({$user->email}) is now linked to this Telegram chat.\n\nYou will now receive your job alerts right here!"
                        );
                        return;
                    } else {
                        \Illuminate\Support\Facades\Log::warning("No user found matching identifier: {$identifier}");
                    }
                }
            case '/status':
                $user = User::where('telegram_chat_id', $chatId)->first();
                if ($user) {
                    $this->telegramService->sendMessage(
                        $chatId,
                        "🟢 *Connected*\nYour Telegram is linked to JobPulse account: `{$user->email}`"
                    );
                } else {
                    $this->telegramService->sendMessage(
                        $chatId,
                        "🔴 *Not Connected*\nThis Telegram chat is not linked to any JobPulse account. Use `/start YOUR_EMAIL` to link it."
                    );
                }
                break;

            case '/stop':
                $user = User::where('telegram_chat_id', $chatId)->first();
                if ($user) {
                    $user->update([
                        'telegram_chat_id' => null,
                        'telegram_username' => null, 
                        'telegram_connected_at' => null,
                    ]);
                    $this->telegramService->sendMessage(
                        $chatId,
                        "🔕 Unlinked successfully. You will no longer receive job alerts here."
                    );
                } else {
                    $this->telegramService->sendMessage(
                        $chatId,
                        "You were not connected to any JobPulse account."
                    );
                }
                break;

            default:
                $this->telegramService->sendMessage($chatId, "Unknown command. Available commands:\n/start - Connect account\n/status - Check status\n/stop - Unlink account");
                break;
        }
    }
}