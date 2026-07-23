<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    /**
     * Display the authenticated user's profile.
     */
    public function show(Request $request)
    {
        return response()->json($request->user()->load('skills'));
    }
    /**
     * Update the authenticated user's profile information and skills.
     */
   public function update(Request $request)
{
    $user = $request->user();

    $validated = $request->validate([
        'name' => ['sometimes', 'string', 'max:255'],
        'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
        'role' => ['sometimes', 'nullable', 'string', 'max:255'],
        'location' => ['sometimes', 'nullable', 'string', 'max:255'],
        'bio' => ['sometimes', 'nullable', 'string'],
        'skills' => ['sometimes', 'nullable', 'array'],
        'skills.*' => ['string'],
    ]);

    $user->fill($request->only(['name', 'email', 'role', 'location', 'bio']));

    if ($user->isDirty('email')) {
        $user->email_verified_at = null;
    }

    $user->save();


    if ($request->has('skills')) {
        $skillIds = [];
        foreach ($request->skills as $skillName) {
            $skill = \App\Models\Skill::firstOrCreate(['name' => trim($skillName)]);
            $skillIds[] = $skill->id;
        }
        $user->syncSkills($skillIds);
    }

    return response()->json([
        'message' => 'Profile updated successfully.',
        'user' => $user->load('skills'), // <--- Ensure skills relation is loaded here
    ]);
}

    /**
     * Update the authenticated user's password.
     */
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }
}