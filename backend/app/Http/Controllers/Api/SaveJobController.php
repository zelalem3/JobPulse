<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobListing;
use App\Models\SavedJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SaveJobController extends Controller
{
    /**
     * Save a job listing for the authenticated user.
     */
    public function store(Request $request, $id)
    {
        // 1. Check if user is authenticated first
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $user = $request->user();

        // 2. Prevent duplicate saves (Optional but highly recommended)
        $alreadySaved = SavedJob::where('user_id', $user->id)
            ->where('job_listing_id', $id)
            ->exists();

        if ($alreadySaved) {
            return response()->json(['message' => 'You have already saved this job.'], 400);
        }

        // 3. Create the record
        $new_save = SavedJob::create([
            'user_id' => $user->id,
            'job_listing_id' => $id,
        ]);

        return response()->json([
            'message' => 'Job saved successfully.',
            'job' => $new_save,
        ], 201);
    }

    /**
     * Get all saved job listings for the authenticated user.
     */
    public function getSaved()
    {
 
        if (!Auth::check()) {
            return response()->json([
                'message' => 'Unauthorized access'
            ], 401); 
        }
        
        
        $saved_jobs = Auth::user()->savedJobs; 

     
        return response()->json([
            "message" => "successfully fetched",
            'savedjobs' => $saved_jobs,
        ], 200);
    }
}