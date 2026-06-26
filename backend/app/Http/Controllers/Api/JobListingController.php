<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\JobListing;

class JobListingController extends Controller
{
    /**
     * Display a listing of jobs.
     */
    public function index(Request $request)
    {
        $perPage = $request->per_page ?? 10;

        $jobs = JobListing::latest()->paginate($perPage);

        return response()->json($jobs);
    }

    /**
     * Store a newly created job.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'company' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'description' => 'required|string',
            'salary' => 'nullable|string|max:255',
            'job_type' => 'nullable|string|max:100',
            'apply_link' => 'required|url',
            'deadline' => 'nullable|date',
        ]);

        $validated['user_id'] = Auth::id();

        $job = JobListing::create($validated);

        return response()->json([
            'message' => 'Job created successfully.',
            'job' => $job,
        ], 201);
    }

    /**
     * Display the specified job.
     */
    public function show(string $id)
    {
        $job = JobListing::find($id);

        if (!$job) {
            return response()->json([
                'message' => 'Job not found.'
            ], 404);
        }

        return response()->json($job);
    }

    /**
     * Update the specified job.
     */
    public function update(Request $request, string $id)
    {
        $job = JobListing::find($id);

        if (!$job) {
            return response()->json([
                'message' => 'Job not found.'
            ], 404);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'company' => 'sometimes|string|max:255',
            'location' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'salary' => 'sometimes|string|max:255',
            'job_type' => 'sometimes|string|max:100',
            'apply_link' => 'sometimes|url',
            'deadline' => 'sometimes|date',
        ]);

        $job->update($validated);

        return response()->json([
            'message' => 'Job updated successfully.',
            'job' => $job,
        ]);
    }

    /**
     * Remove the specified job.
     */
    public function destroy(string $id)
    {
        $job = JobListing::find($id);

        if (!$job) {
            return response()->json([
                'message' => 'Job not found.'
            ], 404);
        }

        $job->delete();

        return response()->json([
            'message' => 'Job deleted successfully.'
        ]);
    }
}