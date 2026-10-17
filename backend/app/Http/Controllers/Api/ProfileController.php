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

        // Ensure the user has a profile row
        $user->profile()->firstOrCreate(
            ['user_id' => $user->id]
        );

        $user->load(['skills', 'profile']);

        return response()->json($user);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            // User fields (only identity-related)
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'role' => ['sometimes', 'nullable', 'string', 'max:255'],

            // Profile fields
            'headline' => ['sometimes', 'nullable', 'string', 'max:255'],
            'bio' => ['sometimes', 'nullable', 'string'],
            'experience_level' => ['sometimes', 'nullable', 'string', 'max:50'],
            'years_of_experience' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:60'],
            'location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'work_preference' => ['sometimes', 'nullable', 'string', 'max:50'],
            'expected_salary_min' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'expected_salary_max' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'availability' => ['sometimes', 'nullable', 'string', 'max:100'],
            'open_to_work' => ['sometimes', 'boolean'],
            'github_url' => ['sometimes', 'nullable', 'url', 'max:255'],
            'linkedin_url' => ['sometimes', 'nullable', 'url', 'max:255'],
            'portfolio_url' => ['sometimes', 'nullable', 'url', 'max:255'],
            'resume_path' => ['sometimes', 'nullable', 'string', 'max:255'],

            // Skills (only touched when sent)
            'skills' => ['sometimes', 'nullable', 'array'],
            'skills.*' => ['string', 'max:255'],
        ]);

        // 1. Update User fields (identity only)
        $user->fill([
            'name'  => $validated['name']  ?? $user->name,
            'email' => $validated['email'] ?? $user->email,
            'role'  => $validated['role']  ?? $user->role,
        ]);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        // 2. Update or create Profile
        $profileData = collect($validated)->only([
            'headline',
            'bio',
            'experience_level',
            'years_of_experience',
            'location',
            'work_preference',
            'expected_salary_min',
            'expected_salary_max',
            'availability',
            'open_to_work',
            'github_url',
            'linkedin_url',
            'portfolio_url',
            'resume_path',
        ])->toArray();

        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            $profileData
        );

        // 3. Skills (only if the frontend sent the "skills" key)
        if ($request->has('skills')) {
            $skillIds = [];

            foreach ($request->input('skills', []) as $skillName) {
                $skillName = trim($skillName);

                if ($skillName === '') {
                    continue;
                }

                $skill = Skill::firstOrCreate(['name' => $skillName]);
                $skillIds[] = $skill->id;
            }

            $user->skills()->sync($skillIds);
        }

        // 4. Clear recommendation cache
        Cache::forget(
            "job_recommendations:{$user->id}:" . now()->toDateString() . ":10"
        );

        // 5. Return fresh data
        $user->refresh();
        $user->load(['skills', 'profile']);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $user,
        ], 200);
    }

    /**
     * Update the authenticated user's password.
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Password updated successfully!',
        ], 200);
    }
}