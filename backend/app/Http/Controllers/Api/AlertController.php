<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobAlert;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AlertController extends Controller
{
    /**
     * Get the authenticated user's alerts and matching skills.
     */
    public function index()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 401);
        }

        $user->load('skills');

        return response()->json([
            'skills' => $user->skills,
            'alerts' => $user->jobAlerts()
                ->latest()
                ->get(),
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

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 401);
        }

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
         * ---------------------------------------------------------
         * 1. Find or create the canonical Skill
         * ---------------------------------------------------------
         *
         * The alert keyword becomes a user matching skill.
         */
        $skill = Skill::firstOrCreate([
            'name' => $keyword,
        ]);

        /*
         * ---------------------------------------------------------
         * 2. Add the skill to the user
         * ---------------------------------------------------------
         *
         * IMPORTANT:
         * syncWithoutDetaching() preserves every existing skill.
         *
         * We intentionally do NOT use sync() here because that
         * would replace the user's entire skill collection.
         */
        $user->skills()->syncWithoutDetaching([
            $skill->id,
        ]);

        /*
         * ---------------------------------------------------------
         * 3. Create the alert
         * ---------------------------------------------------------
         *
         * Prevent duplicate alerts for the same user + keyword.
         */
        $alert = JobAlert::firstOrCreate(
            [
                'user_id' => $user->id,
                'keyword' => $keyword,
            ],
            [
                'location' => $validated['location'] ?? null,
                'category' => $validated['category'] ?? null,
                'telegram_enabled' => true,
                'email_enabled' => true,

                // Check existing jobs from the previous 24 hours
                // when the alert is first created.
                'last_checked_at' => now()->subDay(),
            ]
        );

        /*
         * ---------------------------------------------------------
         * 4. Reload relationships
         * ---------------------------------------------------------
         */
        $user->load('skills');

        /*
         * ---------------------------------------------------------
         * 5. Return the complete current state
         * ---------------------------------------------------------
         */
        return response()->json([
            'message' => 'Alert and matching skill added successfully.',
            'skill' => $skill,
            'alert' => $alert,
            'skills' => $user->skills,
            'alerts' => $user->jobAlerts()
                ->latest()
                ->get(),
        ], 201);
    }

    /**
     * Delete a job alert.
     *
     * IMPORTANT:
     * We do NOT remove the corresponding skill.
     *
     * The user may still want jobs containing that skill in
     * recommendations even after disabling notifications.
     */
    public function destroy(string $id)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 401);
        }

        $alert = JobAlert::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$alert) {
            return response()->json([
                'message' => 'Alert not found.',
            ], 404);
        }

        $alert->delete();

        $user->load('skills');

        return response()->json([
            'message' => 'Alert deleted successfully.',
            'alerts' => $user->jobAlerts()
                ->latest()
                ->get(),
            'skills' => $user->skills,
        ], 200);
    }
}