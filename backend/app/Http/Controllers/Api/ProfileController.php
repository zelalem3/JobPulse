<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's profile.
     */
    public function show(Request $request)
    {
        $user = $request->user();

        $user->load('skills');

        return response()->json(
            $user
        );
    }

    /**
     * Update the authenticated user's password.
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => [
                'required',
                'current_password',
            ],

            'password' => [
                'required',
                'confirmed',
                Password::defaults(),
            ],
        ]);

        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Password updated successfully!',
        ], 200);
    }

    /**
     * Update the authenticated user's profile.
     *
     * Skills are only modified when the request explicitly
     * contains the "skills" field.
     *
     * This prevents unrelated profile updates from accidentally
     * deleting the user's skills.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => [
                'sometimes',
                'string',
                'max:255',
            ],

            'email' => [
                'sometimes',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],

            'role' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'location' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'bio' => [
                'sometimes',
                'nullable',
                'string',
            ],

            /*
             * Skills are optional.
             *
             * If this field isn't sent, existing skills remain
             * completely untouched.
             */
            'skills' => [
                'sometimes',
                'nullable',
                'array',
            ],

            'skills.*' => [
                'string',
                'max:255',
            ],
        ]);

        /*
         * ---------------------------------------------------------
         * 1. Update normal profile fields
         * ---------------------------------------------------------
         */
        $user->fill([
            'name' => $validated['name'] ?? $user->name,
            'email' => $validated['email'] ?? $user->email,
            'role' => $validated['role'] ?? $user->role,
            'location' => $validated['location'] ?? $user->location,
            'bio' => $validated['bio'] ?? $user->bio,
        ]);

        /*
         * If email changes, require verification again.
         */
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        /*
         * ---------------------------------------------------------
         * 2. Explicit skill update
         * ---------------------------------------------------------
         *
         * Only execute this block when the frontend actually
         * sends "skills".
         *
         * This means:
         *
         * PUT /profile
         * { "name": "Zelalem" }
         *
         * does NOT touch skills.
         *
         * But:
         *
         * PUT /profile
         * {
         *     "skills": ["Django", "React"]
         * }
         *
         * intentionally replaces the user's skill list.
         */
        if ($request->has('skills')) {
            $skillIds = [];

            foreach ($request->input('skills', []) ?? [] as $skillName) {
                $skillName = trim($skillName);

                if ($skillName === '') {
                    continue;
                }

                /*
                 * Reuse an existing canonical skill where possible.
                 */
                $skill = Skill::firstOrCreate([
                    'name' => $skillName,
                ]);

                $skillIds[] = $skill->id;
            }

            /*
             * This is intentional here.
             *
             * The profile page is explicitly saying:
             * "These are my skills."
             *
             * Therefore skills removed from the profile should
             * also be detached from the user.
             */
            $user->skills()->sync($skillIds);
        }

        /*
         * ---------------------------------------------------------
         * 3. Clear recommendation cache
         * ---------------------------------------------------------
         */
        Cache::forget(
            "job_recommendations:{$user->id}:"
            . now()->toDateString()
            . ":10"
        );

        /*
         * ---------------------------------------------------------
         * 4. Return fresh profile
         * ---------------------------------------------------------
         */
        $user->refresh();
        $user->load('skills');

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $user,
        ], 200);
    }
}