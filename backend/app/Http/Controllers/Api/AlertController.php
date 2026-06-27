<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\JobAlert;
use Illuminate\Support\Facades\Auth; // Fixed: Added missing Auth import

class AlertController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // 1. Guard check to make sure the user is authenticated
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // 2. Query alerts belonging to the authenticated user
        $alerts = JobAlert::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        // 3. Return the paginated response to your frontend
        return response()->json($alerts, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function create(Request $request)
    {
        // Added Validation for safety
        $validated = $request->validate([
            'keyword'  => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        
        $new_alert = JobAlert::create([
            "user_id"  => $user->id,
            "keyword"  => $validated['keyword'],
            "location" => $validated['location'],
        ]);

        return response()->json([
            'message' => 'Job alert created successfully.',
            'alert'   => $new_alert, // Changed 'job' to 'alert' for consistency
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        
        $alert = JobAlert::where('user_id', Auth::id())->findOrFail($id);

        return response()->json([
            'message' => 'success',
            'alert'   => $alert
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // 1. Find the alert belonging specifically to the logged-in user
        $alert = JobAlert::where('user_id', Auth::id())->findOrFail($id);

        // 2. Validate incoming request payload
        $validated = $request->validate([
            'keyword'  => 'sometimes|required|string|max:255',
            'location' => 'sometimes|nullable|string|max:255',
        ]);

        // 3. Perform the update
        $alert->update($validated);

        return response()->json([
            'message' => 'Job alert updated successfully.',
            'alert'   => $alert
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // 1. Find the alert belonging specifically to the logged-in user
        $alert = JobAlert::where('user_id', Auth::id())->findOrFail($id);

        // 2. Delete the record
        $alert->delete();

        return response()->json([
            'message' => 'Job alert deleted successfully.'
        ], 200);
    }
}