<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobListing;
use Illuminate\Http\Request;

class JobListingController extends Controller
{
    /**
     * Display jobs with search, filtering, sorting and pagination.
     */
    public function index(Request $request)
    {
        $perPage = min((int) $request->input('per_page', 10), 100);

        $search = trim((string) $request->input('search', ''));
        $source = $request->input('source');
        $location = $request->input('location');
        $employmentType = $request->input('employment_type');
        $experienceLevel = $request->input('experience_level');
        $category = $request->input('category');
        $sort = $request->input('sort', 'newest');

        $query = JobListing::with([
            'skills',
            'company',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Search
        |--------------------------------------------------------------------------
        */

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ILIKE', "%{$search}%")
                    ->orWhere('location', 'ILIKE', "%{$search}%")
                    ->orWhere('description', 'ILIKE', "%{$search}%")
                    ->orWhere('requirements', 'ILIKE', "%{$search}%")
                    ->orWhere('responsibilities', 'ILIKE', "%{$search}%")
                    ->orWhere('category', 'ILIKE', "%{$search}%")
                    ->orWhereHas('company', function ($companyQuery) use ($search) {
                        $companyQuery->where(
                            'name',
                            'ILIKE',
                            "%{$search}%"
                        );
                    });
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Source
        |--------------------------------------------------------------------------
        */

        if ($source) {
            $sources = array_filter(
                array_map('trim', explode(',', $source))
            );

            if (!empty($sources)) {
                $query->whereIn('source', $sources);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Location
        |--------------------------------------------------------------------------
        */

        if ($location) {
            $locations = array_filter(
                array_map('trim', explode(',', $location))
            );

            if (!empty($locations)) {
                $query->whereIn('location', $locations);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Employment Type
        |--------------------------------------------------------------------------
        */

        if ($employmentType) {
            $types = array_filter(
                array_map('trim', explode(',', $employmentType))
            );

            if (!empty($types)) {
                $query->whereIn('employment_type', $types);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Experience Level
        |--------------------------------------------------------------------------
        */

        if ($experienceLevel) {
            $levels = array_filter(
                array_map('trim', explode(',', $experienceLevel))
            );

            if (!empty($levels)) {
                $query->whereIn('experience_level', $levels);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Category
        |--------------------------------------------------------------------------
        */

        if ($category) {
            $categories = array_filter(
                array_map('trim', explode(',', $category))
            );

            if (!empty($categories)) {
                $query->whereIn('category', $categories);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Sorting
        |--------------------------------------------------------------------------
        */

        switch ($sort) {
            case 'oldest':
                $query->orderBy('posted_at', 'asc');
                break;

            case 'quality':
                $query->orderByDesc('quality_score');
                break;

            case 'deadline':
                $query->orderByRaw(
                    'deadline IS NULL, deadline ASC'
                );
                break;

            case 'newest':
            default:
                $query->orderByDesc('posted_at');
                break;
        }

        return response()->json(
            $query->paginate($perPage)
        );
    }

    /**
     * Return available filter options.
     */
    public function filters()
    {
        return response()->json([
            'sources' => JobListing::query()
                ->whereNotNull('source')
                ->where('source', '!=', '')
                ->distinct()
                ->orderBy('source')
                ->pluck('source')
                ->values(),

            'locations' => JobListing::query()
                ->whereNotNull('location')
                ->where('location', '!=', '')
                ->distinct()
                ->orderBy('location')
                ->pluck('location')
                ->values(),

            'employment_types' => JobListing::query()
                ->whereNotNull('employment_type')
                ->where('employment_type', '!=', '')
                ->distinct()
                ->orderBy('employment_type')
                ->pluck('employment_type')
                ->values(),

            'experience_levels' => JobListing::query()
                ->whereNotNull('experience_level')
                ->where('experience_level', '!=', '')
                ->distinct()
                ->orderBy('experience_level')
                ->pluck('experience_level')
                ->values(),

            'categories' => JobListing::query()
                ->whereNotNull('category')
                ->where('category', '!=', '')
                ->distinct()
                ->orderBy('category')
                ->pluck('category')
                ->values(),
        ]);
    }

    /**
     * Display the specified job.
     */
    public function show(string $id)
    {
        $job = JobListing::with([
            'skills',
            'company',
        ])->find($id);

        if (!$job) {
            return response()->json([
                'message' => 'Job not found.'
            ], 404);
        }

        return response()->json($job);
    }
}