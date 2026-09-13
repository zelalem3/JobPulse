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

    /**
     * Handle incoming Telegram webhook updates.
     */
    public function handle(Request $request)
    {
        try {
            $update = $request->all();

            Log::info('Telegram webhook received:', $update);

            // Ignore updates that are not messages.
            if (!isset($update['message'])) {
                return response()->json([
                    'status' => 'ignored',
                ]);
            }

            $message = $update['message'];

            $chatId = $message['chat']['id'] ?? null;

            $text = trim($message['text'] ?? '');

            $from = $message['from'] ?? [];

            $username = $from['username'] ?? null;

            $firstName = (
                !empty($from['first_name'])
                && trim($from['first_name']) !== '.'
            )
                ? $from['first_name']
                : ($username ?? 'User');

            if (!$chatId) {
                return response()->json([
                    'status' => 'no_chat_id',
                ]);
            }

            // Handle commands.
            if (str_starts_with($text, '/')) {
                $this->handleCommand(
                    $chatId,
                    $text,
                    $username,
                    $firstName
                );
            } else {
                $this->telegramService->sendMessage(
                    $chatId,
                    "Hi {$firstName}! Use /start to connect your "
                    . "JobPulse account or /status to check your connection."
                );
            }

            return response()->json([
                'status' => 'success',
            ]);
        } catch (\Throwable $e) {
            Log::error('Telegram webhook error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Internal server error',
            ], 500);
        }
    }

    /**
     * Handle Telegram commands.
     */
    protected function handleCommand(
        string|int $chatId,
        string $text,
        ?string $username,
        string $firstName
    ): void {
        // Split command and arguments using whitespace.
        $parts = preg_split('/\s+/', trim($text));

        $parts = $parts ?: [];

        // Extract command and remove Telegram bot mention.
        $command = strtolower($parts[0] ?? '');

        $command = explode('@', $command)[0];

        Log::info(
            "Handling command [{$command}] for chat ID [{$chatId}]"
        );

        switch ($command) {

            /*
            |--------------------------------------------------------------------------
            | START
            |--------------------------------------------------------------------------
            */

            case '/start':

                if (isset($parts[1])) {

                    $identifier = trim($parts[1]);

                    Log::info(
                        "Attempting to link Telegram chat {$chatId} "
                        . "to identifier: {$identifier}"
                    );

                    // Search by email or numeric user ID.
                    $userQuery = User::where('email', $identifier);

                    if (is_numeric($identifier)) {
                        $userQuery->orWhere(
                            'id',
                            (int) $identifier
                        );
                    }

                    $user = $userQuery->first();

                    if ($user) {

                        /*
                        |--------------------------------------------------------------------------
                        | Prevent duplicate Telegram chat connections.
                        |--------------------------------------------------------------------------
                        */

                        User::where('telegram_chat_id', $chatId)
                            ->where('id', '!=', $user->id)
                            ->update([
                                'telegram_chat_id' => null,
                                'telegram_username' => null,
                                'telegram_connected_at' => null,
                            ]);

                        Log::info(
                            "User found: {$user->email}. "
                            . "Updating Telegram connection fields."
                        );

                        $user->update([
                            'telegram_chat_id' => $chatId,
                            'telegram_username' => $username,
                            'telegram_connected_at' => now(),
                        ]);

                        $this->telegramService->sendMessage(
                            $chatId,
                            "✅ Success, {$firstName}!\n\n"
                            . "Your JobPulse account ({$user->email}) "
                            . "is now linked to this Telegram chat.\n\n"
                            . "You will now receive your job alerts right here!"
                        );

                    } else {

                        Log::warning(
                            "User not found for identifier: {$identifier}"
                        );

                        $this->telegramService->sendMessage(
                            $chatId,
                            "❌ We couldn't find a JobPulse account "
                            . "matching '{$identifier}'.\n\n"
                            . "Please use your registered email address:\n"
                            . "/start your-email@example.com"
                        );
                    }

                } else {

                    $this->telegramService->sendMessage(
                        $chatId,
                        "Welcome to JobPulse, {$firstName}!\n\n"
                        . "To link your account, please send your "
                        . "registration email like this:\n\n"
                        . "/start your-email@example.com"
                    );
                }

                break;

            /*
            |--------------------------------------------------------------------------
            | STATUS
            |--------------------------------------------------------------------------
            */

            case '/status':

                Log::info(
                    "Checking connection status for chat ID: {$chatId}"
                );

                $user = User::where(
                    'telegram_chat_id',
                    $chatId
                )->first();

                if ($user) {

                    Log::info(
                        "Connected user found: {$user->email}"
                    );

                    $this->telegramService->sendMessage(
                        $chatId,
                        "🟢 Connected\n\n"
                        . "Your Telegram is linked to JobPulse account:\n"
                        . "{$user->email}"
                    );

                } else {

                    Log::info(
                        "Chat ID {$chatId} is not linked to any user."
                    );

                    $this->telegramService->sendMessage(
                        $chatId,
                        "🔴 Not Connected\n\n"
                        . "This Telegram chat is not linked to any "
                        . "JobPulse account.\n\n"
                        . "Use /start YOUR_EMAIL to link it."
                    );
                }

                break;

            /*
            |--------------------------------------------------------------------------
            | STOP
            |--------------------------------------------------------------------------
            */

            case '/stop':

                Log::info(
                    "Unlinking request received for chat ID: {$chatId}"
                );

                $user = User::where(
                    'telegram_chat_id',
                    $chatId
                )->first();

                if ($user) {

                    $user->update([
                        'telegram_chat_id' => null,
                        'telegram_username' => null,
                        'telegram_connected_at' => null,
                    ]);

                    Log::info(
                        "Successfully unlinked user {$user->email} "
                        . "from Telegram chat {$chatId}"
                    );

                    $this->telegramService->sendMessage(
                        $chatId,
                        "🔕 Unlinked successfully.\n\n"
                        . "You will no longer receive job alerts here."
                    );

                } else {

                    Log::info(
                        "Unlink failed: Chat ID {$chatId} "
                        . "was not linked to any account."
                    );

                    $this->telegramService->sendMessage(
                        $chatId,
                        "You were not connected to any JobPulse account."
                    );
                }

                break;

            /*
            |--------------------------------------------------------------------------
            | UNKNOWN COMMAND
            |--------------------------------------------------------------------------
            */

            default:

                Log::warning(
                    "Unknown command received: {$command}"
                );

                $this->telegramService->sendMessage(
                    $chatId,
                    "Unknown command.\n\n"
                    . "Available commands:\n"
                    . "/start - Connect account\n"
                    . "/status - Check status\n"
                    . "/stop - Unlink account"
                );

                break;
        }
    }
}