<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobListing;
use Illuminate\Http\Request;

class JobSearchController extends Controller
{
    /**
     * Advanced job search.
     */
    public function index(Request $request)
    {
        $search = trim($request->input('q', ''));
        $perPage = min((int) $request->input('per_page', 10), 50);

        if (empty($search)) {
            return response()->json([
                'message' => 'Search query is required.',
                'results' => [],
            ], 422);
        }

        $query = JobListing::with('skills');

        /*
        |--------------------------------------------------------------------------
        | Search title, company, location and description
        |--------------------------------------------------------------------------
        */

        $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('company', 'like', "%{$search}%")
                ->orWhere('location', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        });

        /*
        |--------------------------------------------------------------------------
        | Search skills
        |--------------------------------------------------------------------------
        */

        $query->orWhereHas('skills', function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%");
        });

        /*
        |--------------------------------------------------------------------------
        | Optional filters
        |--------------------------------------------------------------------------
        */

        if ($source = $request->input('source')) {
            $sources = is_array($source)
                ? $source
                : explode(',', $source);

            $query->whereIn(
                'source',
                array_filter(array_map('trim', $sources))
            );
        }

        if ($location = trim($request->input('location', ''))) {
            $query->where(
                'location',
                'like',
                "%{$location}%"
            );
        }

        if ($jobType = $request->input('job_type')) {
            $jobTypes = is_array($jobType)
                ? $jobType
                : explode(',', $jobType);

            $query->whereIn(
                'job_type',
                array_filter(array_map('trim', $jobTypes))
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Active jobs only
        |--------------------------------------------------------------------------
        */

        if ($request->boolean('active_only')) {
            $query->where(function ($q) {
                $q->whereNull('deadline')
                    ->orWhereDate(
                        'deadline',
                        '>=',
                        now()->toDateString()
                    );
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Sorting
        |--------------------------------------------------------------------------
        */

        switch ($request->input('sort', 'relevance')) {
            case 'newest':
                $query->latest();
                break;

            case 'oldest':
                $query->oldest();
                break;

            case 'deadline':
                $query
                    ->orderByRaw(
                        'CASE WHEN deadline IS NULL THEN 1 ELSE 0 END'
                    )
                    ->orderBy('deadline', 'asc');
                break;

            case 'company':
                $query->orderBy('company', 'asc');
                break;

            case 'title':
                $query->orderBy('title', 'asc');
                break;

            /*
            |--------------------------------------------------------------------------
            | Basic relevance
            |--------------------------------------------------------------------------
            |
            | Prioritize title matches over other fields.
            |
            */

            case 'relevance':
            default:
                $query->orderByRaw(
                    "
                    CASE
                        WHEN title LIKE ? THEN 1
                        WHEN company LIKE ? THEN 2
                        WHEN location LIKE ? THEN 3
                        ELSE 4
                    END
                    ",
                    [
                        "%{$search}%",
                        "%{$search}%",
                        "%{$search}%",
                    ]
                );

                $query->latest();
                break;
        }

        $results = $query->paginate($perPage);

        return response()->json([
            'query' => $search,
            'results' => $results,
        ]);
    }
}