<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class TelegramController extends Controller
{
    public function connect(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'telegram_chat_id' => 'required|string|max:255',
            'telegram_username' => 'nullable|string|max:255',
        ]);

        $user->update([
            'telegram_chat_id' => $validated['telegram_chat_id'],
            'telegram_username' => $validated['telegram_username'] ?? null,
            'telegram_connected_at' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Telegram account connected successfully.',
            'telegram_chat_id' => $user->telegram_chat_id,
            'telegram_connected_at' => $user->telegram_connected_at,
        ], 200);
    }

    public function disconnect(Request $request)
    {
        $user = $request->user();

        $user->update([
            'telegram_chat_id' => null,
            'telegram_username' => null,
            'telegram_connected_at' => null,
        ]);

        return response()->json([
            'message' => 'Telegram account disconnected successfully.',
        ], 200);
    }

    public function status(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'connected' => !empty($user->telegram_chat_id),
            'telegram_username' => $user->telegram_username,
            'telegram_connected_at' => $user->telegram_connected_at,
        ], 200);
    }
}