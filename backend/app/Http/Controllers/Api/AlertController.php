<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobAlert;
use App\Models\Skill;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    /**
     * Get the authenticated user's alerts, skills, and profile.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Ensure profile exists
        $user->profile()->firstOrCreate(
            ['user_id' => $user->id]
        );

        $user->load(['skills', 'profile']);

        return response()->json([
            'skills'  => $user->skills,
            'alerts'  => $user->jobAlerts()->latest()->get(),
            'profile' => $user->profile,
        ], 200);
    }

    /**
     * Create a job alert.
     *
     * The alert keyword is also treated as a matching skill.
     * Existing user skills are preserved.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'location' => [
                'nullable',
                'string',
                'max:255',
            ],
            'category' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        $keyword = trim($validated['name']);

        if ($keyword === '') {
            return response()->json([
                'message' => 'Keyword cannot be empty.',
            ], 422);
        }

        /*
         * 1. Find or create the canonical Skill
         */
        $skill = Skill::firstOrCreate([
            'name' => $keyword,
        ]);

        /*
         * 2. Attach skill to the user (preserves existing skills)
         */
        $user->skills()->syncWithoutDetaching([
            $skill->id,
        ]);

        /*
         * 3. Ensure profile exists
         */
        $user->profile()->firstOrCreate(
            ['user_id' => $user->id]
        );

        /*
         * 4. Create the alert (no duplicates for same user + keyword)
         */
        $alert = JobAlert::firstOrCreate(
            [
                'user_id' => $user->id,
                'keyword' => $keyword,
            ],
            [
                'location'         => $validated['location'] ?? null,
                'category'         => $validated['category'] ?? null,
                'telegram_enabled' => true,
                'email_enabled'    => true,
                'last_checked_at'  => now()->subDay(),
            ]
        );

        /*
         * 5. Reload relationships
         */
        $user->load(['skills', 'profile']);

        return response()->json([
            'message' => 'Alert and matching skill added successfully.',
            'skill'   => $skill,
            'alert'   => $alert,
            'skills'  => $user->skills,
            'alerts'  => $user->jobAlerts()->latest()->get(),
            'profile' => $user->profile,
        ], 201);
    }

    /**
     * Delete a job alert.
     *
     * We do NOT remove the corresponding skill.
     * The user may still want that skill in recommendations.
     */
    public function destroy(Request $request, string $id)
    {
        $user = $request->user();

        $alert = JobAlert::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$alert) {
            return response()->json([
                'message' => 'Alert not found.',
            ], 404);
        }

        $alert->delete();

        $user->load(['skills', 'profile']);

        return response()->json([
            'message' => 'Alert deleted successfully.',
            'alerts'  => $user->jobAlerts()->latest()->get(),
            'skills'  => $user->skills,
            'profile' => $user->profile,
        ], 200);
    }
}