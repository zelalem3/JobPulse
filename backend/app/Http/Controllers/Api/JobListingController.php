<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobListing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JobListingController extends Controller
{
    /**
     * Display jobs with search, filters, sorting and pagination.
     */
    public function index(Request $request)
    {
        $perPage = min((int) $request->input('per_page', 10), 100);

        $query = JobListing::with('skills');

        /*
        |--------------------------------------------------------------------------
        | SEARCH
        |--------------------------------------------------------------------------
        */
        if ($search = trim((string) $request->input('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('source', 'like', "%{$search}%");
            });
        }

        /*
        |--------------------------------------------------------------------------
        | SOURCE FILTER
        |--------------------------------------------------------------------------
        */
        if ($request->filled('source')) {
            $sources = is_array($request->source)
                ? $request->source
                : explode(',', $request->source);

            $sources = array_values(
                array_filter(
                    array_map('trim', $sources)
                )
            );

            if (!empty($sources)) {
                $query->whereIn('source', $sources);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | LOCATION FILTER
        |--------------------------------------------------------------------------
        */
        if ($request->filled('location')) {
            $locations = is_array($request->location)
                ? $request->location
                : explode(',', $request->location);

            $locations = array_values(
                array_filter(
                    array_map('trim', $locations)
                )
            );

            if (!empty($locations)) {
                $query->whereIn('location', $locations);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | JOB TYPE FILTER
        |--------------------------------------------------------------------------
        |
        | Your database appears to use job_type while the frontend previously
        | used job.type. We normalize this on the frontend later.
        |
        */
        if ($request->filled('job_type')) {
            $jobTypes = is_array($request->job_type)
                ? $request->job_type
                : explode(',', $request->job_type);

            $jobTypes = array_values(
                array_filter(
                    array_map('trim', $jobTypes)
                )
            );

            if (!empty($jobTypes)) {
                $query->whereIn('job_type', $jobTypes);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | ACTIVE JOBS ONLY
        |--------------------------------------------------------------------------
        |
        | A job is considered active when it has no deadline OR its deadline
        | hasn't passed.
        |
        */
        if ($request->boolean('active_only')) {
            $query->where(function ($q) {
                $q->whereNull('deadline')
                    ->orWhereDate('deadline', '>=', now()->toDateString());
            });
        }

        /*
        |--------------------------------------------------------------------------
        | SORTING
        |--------------------------------------------------------------------------
        */
        switch ($request->input('sort', 'newest')) {
            case 'oldest':
                $query->oldest('scraped_at');
                break;

            case 'deadline':
                $query->orderByRaw(
                    'CASE WHEN deadline IS NULL THEN 1 ELSE 0 END'
                )
                ->orderBy('deadline', 'asc');
                break;

            case 'title':
                $query->orderBy('title', 'asc');
                break;

            case 'company':
                $query->orderBy('company', 'asc');
                break;

            case 'newest':
            default:
                $query->latest('scraped_at');
                break;
        }

        $jobs = $query->paginate($perPage);

        return response()->json($jobs);
    }

    /**
     * Return available filter options.
     */
    public function filters()
    {
        $sources = JobListing::query()
            ->whereNotNull('source')
            ->where('source', '!=', '')
            ->distinct()
            ->orderBy('source')
            ->pluck('source')
            ->values();

        $locations = JobListing::query()
            ->whereNotNull('location')
            ->where('location', '!=', '')
            ->distinct()
            ->orderBy('location')
            ->pluck('location')
            ->values();

        $jobTypes = JobListing::query()
            ->whereNotNull('job_type')
            ->where('job_type', '!=', '')
            ->distinct()
            ->orderBy('job_type')
            ->pluck('job_type')
            ->values();

        return response()->json([
            'sources' => $sources,
            'locations' => $locations,
            'job_types' => $jobTypes,
        ]);
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
     * Display a single job.
     */
    public function show(string $id)
    {
        $job = JobListing::with('skills')->find($id);

        if (!$job) {
            return response()->json([
                'message' => 'Job not found.',
            ], 404);
        }

        return response()->json($job);
    }

    /**
     * Update a job.
     */
    public function update(Request $request, string $id)
    {
        $job = JobListing::find($id);

        if (!$job) {
            return response()->json([
                'message' => 'Job not found.',
            ], 404);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'company' => 'sometimes|string|max:255',
            'location' => 'nullable|string|max:255',
            'description' => 'sometimes|string',
            'salary' => 'nullable|string|max:255',
            'job_type' => 'nullable|string|max:100',
            'apply_link' => 'sometimes|url',
            'deadline' => 'nullable|date',
        ]);

        $job->update($validated);

        return response()->json([
            'message' => 'Job updated successfully.',
            'job' => $job->load('skills'),
        ]);
    }

    /**
     * Delete a job.
     */
    public function destroy(string $id)
    {
        $job = JobListing::find($id);

        if (!$job) {
            return response()->json([
                'message' => 'Job not found.',
            ], 404);
        }

        $job->delete();

        return response()->json([
            'message' => 'Job deleted successfully.',
        ]);
    }
}