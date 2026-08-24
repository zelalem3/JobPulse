<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\JobListing;

class JobListingController extends Controller
{
    /**
     * Display a listing of jobs with search, source filters, and pagination.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search');
        $source = $request->input('source'); // e.g., "Telegram,LinkedIn"

        $query = JobListing::with('skills')->latest();

        // 1. Search Filter (Title, Company, or Location)
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // 2. Source Filter
        if ($source) {
            $sourcesArray = explode(',', $source);
            $query->whereIn('source', array_map('trim', $sourcesArray));
        }

        $jobs = $query->paginate($perPage);

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
     * Display the specified job with skills.
     */
    public function show(string $id)
    {
        $job = JobListing::with('skills')->find($id);

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
            'job' => $job->load('skills'),
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