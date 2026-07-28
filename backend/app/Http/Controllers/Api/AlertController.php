<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Skill;
use App\Models\JobAlert;

class AlertController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return response()->json([
            'skills' => $user->skills()->get(),
            'alerts' => $user->jobAlerts()->get() // Optional: return job alerts if you want them on the frontend too
        ], 200);
    }

    /**
     * Add a skill and create a corresponding job alert.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255', // Optional location input if provided
            'category' => 'nullable|string|max:255', // Optional category input if provided
        ]);

        $keyword = trim($validated['name']);

        // 1. Find or create the skill for email recommendations
        $skill = Skill::firstOrCreate([
            'name' => $keyword
        ]);

        // Attach the skill to the user profile
        $user->addSkill($skill->id);

        // 2. Create the JobAlert record for Telegram notifications
        // firstOrCreate prevents duplicate identical alerts for the same user
        JobAlert::firstOrCreate([
            'user_id' => $user->id,
            'keyword' => $keyword,
        ], [
            'location' => $validated['location'] ?? null,
            'category' => $validated['category'] ?? null,
            'telegram_enabled' => true,
            'email_enabled' => true,
            'last_checked_at' => now()->subDay(), // Ensures it picks up recent listings right away
        ]);

        return response()->json([
            'message' => 'Alert and skill added successfully.',
            'skills'  => $user->skills()->get(),
            'alerts'  => $user->jobAlerts()->get(),
        ], 201);
    }

    public function destroy(string $id)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // If $id represents a skill id, remove it from skills and matching job alerts
        $skill = Skill::find($id);
        if ($skill) {
            $user->removeSkill($id);
            // Optionally clean up matching job alerts
            $user->jobAlerts()->where('keyword', $skill->name)->delete();
        }

        return response()->json([
            'message' => 'Alert and skill removed successfully.',
            'skills'  => $user->skills()->get(),
        ], 200);
    }
}