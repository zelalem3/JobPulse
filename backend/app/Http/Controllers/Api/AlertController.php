<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Skill;

class AlertController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return response()->json([
            'skills' => $user->skills()->get()
        ], 200);
    }

    /**
     * Add a skill by name (creates it if it doesn't exist).
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Find the skill by name or create a new one automatically
        $skill = Skill::firstOrCreate([
            'name' => trim($validated['name'])
        ]);

        // Attach the skill using your model helper
        $user->addSkill($skill->id);

        return response()->json([
            'message' => 'Skill added successfully.',
            'skills'  => $user->skills()->get(),
        ], 201);
    }

    public function destroy(string $id)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user->removeSkill($id);

        return response()->json([
            'message' => 'Skill removed successfully.',
            'skills'  => $user->skills()->get(),
        ], 200);
    }
}