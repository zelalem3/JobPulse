<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobListing;
use App\Models\SavedJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SaveJobController extends Controller
{
    public function index(Request $request)
    {
        $savedJobs = $request->user()
            ->savedJobs()
            ->with('job') // Matches the public function job() in your SavedJob model
            ->get();

        return response()->json([
            'message' => 'successfully fetched',
            'savedjobs' => $savedJobs
        ]);
    }

    /**
     * Toggle save/unsave for a job listing.
     */
    public function store(Request $request, $id)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $user = $request->user();

        // Check if already saved
        $savedJob = SavedJob::where('user_id', $user->id)
            ->where('job_listing_id', $id)
            ->first();

        if ($savedJob) {
            // If already saved, delete it (Unsave)
            $savedJob->delete();
            return response()->json([
                'message' => 'Job unsaved successfully.',
                'isSaved' => false
            ], 200);
        }

        // Otherwise, create the record (Save)
        $new_save = SavedJob::create([
            'user_id' => $user->id,
            'job_listing_id' => $id,
        ]);

        return response()->json([
            'message' => 'Job saved successfully.',
            'job' => $new_save,
            'isSaved' => true
        ], 201);
    }

    /**
     * Explicitly remove/unsave a job listing by ID.
     */
    public function destroy(Request $request, $id)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $user = $request->user();

        // Find the saved record by job_listing_id (or pivot record id depending on setup)
        $savedJob = SavedJob::where('user_id', $user->id)
            ->where(function ($query) use ($id) {
                $query->where('job_listing_id', $id)
                      ->orWhere('id', $id);
            })
            ->first();

        if (!$savedJob) {
            return response()->json([
                'message' => 'Saved job not found.'
            ], 404);
        }

        $savedJob->delete();

        return response()->json([
            'message' => 'Job removed successfully.',
            'isSaved' => false
        ], 200);
    }
}