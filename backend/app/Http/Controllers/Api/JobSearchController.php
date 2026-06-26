<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Job;

class JobSearchController extends Controller
{
    /**
     * Search jobs.
     */
    public function index(Request $request)
    {
        $query = Job::query();

        // Search keyword
        if ($request->filled('q')) {
            $search = $request->q;

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by location
        if ($request->filled('location')) {
            $query->where('location', 'like', "%{$request->location}%");
        }

        // Filter by job type
        if ($request->filled('job_type')) {
            $query->where('job_type', $request->job_type);
        }

        // Pagination
        $jobs = $query->latest()
                      ->paginate($request->per_page ?? 10);

        return response()->json($jobs);
    }
}