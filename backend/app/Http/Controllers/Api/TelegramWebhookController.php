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
        Log::info('Telegram webhook received:', $update);

        // Ensure it's a message update
        if (!isset($update['message'])) {
            Log::warning('Telegram update ignored: no message key present.');
            return response()->json(['status' => 'ignored']);
        }

        $message = $update['message'];
        $chatId = $message['chat']['id'] ?? null;
        $text = trim($message['text'] ?? '');
        
        $from = $message['from'] ?? [];
        $username = $from['username'] ?? null;
        // Safely fallback if first name is blank or a single symbol like '.'
        $firstName = (!empty($from['first_name']) && trim($from['first_name']) !== '.') ? $from['first_name'] : ($username ?? 'User');

        if (!$chatId) {
            Log::error('Telegram webhook error: missing chat ID.');
            return response()->json(['status' => 'no_chat_id']);
        }

        Log::info("Processing message from Chat ID [{$chatId}]: '{$text}'");

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
        // Clean up command string and split parameters safely using regex whitespace matching
        $parts = preg_split('/\s+/', trim($text));
        $command = strtolower($parts[0]);

        Log::info("Handling command [{$command}] for chat ID [{$chatId}]");

        switch ($command) {
            case '/start':
                // Check if they passed a verification token/email to auto-link
                if (isset($parts[1])) {
                    $identifier = trim($parts[1]);
                    Log::info("Attempting to link telegram chat {$chatId} to identifier: {$identifier}");
                    
                    $user = User::where('email', $identifier)->orWhere('id', $identifier)->first();

                    if ($user) {
                        Log::info("User found: {$user->email}. Updating telegram connection fields.");
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
                        Log::warning("No user found matching identifier: {$identifier}");
                        $this->telegramService->sendMessage(
                            $chatId,
                            "❌ No JobPulse account found matching `{$identifier}`. Please check your email address and try again."
                        );
                        return;
                    }
                }

                $this->telegramService->sendMessage(
                    $chatId,
                    "👋 Welcome to *JobPulse Bot*, {$firstName}!\n\nTo link your account, use the web app to connect Telegram, or type:\n`/start YOUR_EMAIL`"
                );
                break;

            case '/status':
                Log::info("Checking connection status for chat ID: {$chatId}");
                $user = User::where('telegram_chat_id', $chatId)->first();
                if ($user) {
                    Log::info("User connected found: {$user->email}");
                    $this->telegramService->sendMessage(
                        $chatId,
                        "🟢 *Connected*\nYour Telegram is linked to JobPulse account: `{$user->email}`"
                    );
                } else {
                    Log::info("Chat ID {$chatId} is not linked to any user.");
                    $this->telegramService->sendMessage(
                        $chatId,
                        "🔴 *Not Connected*\nThis Telegram chat is not linked to any JobPulse account. Use `/start YOUR_EMAIL` to link it."
                    );
                }
                break;

            case '/stop':
                Log::info("Unlinking request received for chat ID: {$chatId}");
                $user = User::where('telegram_chat_id', $chatId)->first();
                if ($user) {
                    $user->update([
                        'telegram_chat_id' => null,
                        'telegram_username' => null,
                        'telegram_connected_at' => null,
                    ]);
                    Log::info("Successfully unlinked user {$user->email} from telegram chat {$chatId}");
                    $this->telegramService->sendMessage(
                        $chatId,
                        "🔕 Unlinked successfully. You will no longer receive job alerts here."
                    );
                } else {
                    Log::info("Unlink failed: Chat ID {$chatId} was not linked to any account.");
                    $this->telegramService->sendMessage(
                        $chatId,
                        "You were not connected to any JobPulse account."
                    );
                }
                break;

            default:
                Log::warning("Unknown command received: {$command}");
                $this->telegramService->sendMessage($chatId, "Unknown command. Available commands:\n/start - Connect account\n/status - Check status\n/stop - Unlink account");
                break;
        }
    }
}