<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobListing;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Canonical job categories (must match scraper infer_category).
     */
    public const CATEGORIES = [
        'Software Development',
        'Data & AI',
        'Cybersecurity',
        'Networking',
        'Engineering',
        'Healthcare',
        'Finance',
        'Accounting',
        'Marketing',
        'Sales',
        'Human Resources',
        'Education',
        'NGO',
        'Customer Service',
        'Logistics',
        'Legal',
        'Administration',
        'Other',
    ];

    /**
     * List all categories with job counts.
     *
     * GET /api/categories
     */
    public function index()
    {
        $counts = JobListing::query()
            ->whereNotNull('category')
            ->where('category', '!=', '')
            ->where('is_active', true)
            ->selectRaw('category, COUNT(*) as jobs_count')
            ->groupBy('category')
            ->pluck('jobs_count', 'category');

        $categories = collect(self::CATEGORIES)->map(function (string $name) use ($counts) {
            return [
                'name' => $name,
                'slug' => $this->toSlug($name),
                'jobs_count' => (int) ($counts[$name] ?? 0),
            ];
        })->values();

        // Include any extra categories present in DB but not in the canonical list
        $extra = $counts->keys()
            ->reject(fn ($name) => in_array($name, self::CATEGORIES, true))
            ->map(fn ($name) => [
                'name' => $name,
                'slug' => $this->toSlug($name),
                'jobs_count' => (int) $counts[$name],
            ])
            ->values();

        return response()->json([
            'categories' => $categories->concat($extra)->values(),
        ]);
    }

    /**
     * List jobs for a given category (by name or slug).
     *
     * GET /api/categories/{category}
     * GET /api/categories/{category}/jobs
     *
     * Query params:
     *  - search
     *  - location
     *  - employment_type
     *  - experience_level
     *  - source
     *  - sort (newest|oldest|quality|deadline)
     *  - per_page
     */
    public function jobs(Request $request, string $category)
    {
        $categoryName = $this->resolveCategory($category);

        if ($categoryName === null) {
            return response()->json([
                'message' => 'Category not found.',
                'available' => self::CATEGORIES,
            ], 404);
        }

        $perPage = min((int) $request->input('per_page', 10), 100);
        $search = trim((string) $request->input('search', ''));
        $location = $request->input('location');
        $employmentType = $request->input('employment_type');
        $experienceLevel = $request->input('experience_level');
        $source = $request->input('source');
        $sort = $request->input('sort', 'newest');

        $query = JobListing::with(['skills', 'company'])
            ->where('is_active', true)
            ->where('category', $categoryName);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ILIKE', "%{$search}%")
                    ->orWhere('description', 'ILIKE', "%{$search}%")
                    ->orWhere('location', 'ILIKE', "%{$search}%")
                    ->orWhereHas('company', function ($companyQuery) use ($search) {
                        $companyQuery->where('name', 'ILIKE', "%{$search}%");
                    });
            });
        }

        if ($location) {
            $locations = array_filter(array_map('trim', explode(',', $location)));
            if (!empty($locations)) {
                $query->whereIn('location', $locations);
            }
        }

        if ($employmentType) {
            $types = array_filter(array_map('trim', explode(',', $employmentType)));
            if (!empty($types)) {
                $query->whereIn('employment_type', $types);
            }
        }

        if ($experienceLevel) {
            $levels = array_filter(array_map('trim', explode(',', $experienceLevel)));
            if (!empty($levels)) {
                $query->whereIn('experience_level', $levels);
            }
        }

        if ($source) {
            $sources = array_filter(array_map('trim', explode(',', $source)));
            if (!empty($sources)) {
                $query->whereIn('source', $sources);
            }
        }

        switch ($sort) {
            case 'oldest':
                $query->orderBy('posted_at', 'asc');
                break;
            case 'quality':
                $query->orderByDesc('quality_score');
                break;
            case 'deadline':
                $query->orderByRaw('deadline IS NULL, deadline ASC');
                break;
            case 'newest':
            default:
                $query->orderByDesc('posted_at');
                break;
        }

        $jobs = $query->paginate($perPage);

        return response()->json([
            'category' => [
                'name' => $categoryName,
                'slug' => $this->toSlug($categoryName),
            ],
            'jobs' => $jobs,
        ]);
    }

    /**
     * Resolve category from slug or exact name (case-insensitive).
     */
    private function resolveCategory(string $input): ?string
    {
        $input = trim(urldecode($input));

        // Exact match (case-insensitive)
        foreach (self::CATEGORIES as $name) {
            if (strcasecmp($name, $input) === 0) {
                return $name;
            }
        }

        // Slug match: "software-development" → "Software Development"
        $slug = $this->toSlug($input);
        foreach (self::CATEGORIES as $name) {
            if ($this->toSlug($name) === $slug) {
                return $name;
            }
        }

        // Fallback: category exists in DB under a non-canonical name
        $existing = JobListing::query()
            ->whereRaw('LOWER(category) = ?', [strtolower($input)])
            ->orWhereRaw("LOWER(REPLACE(category, ' ', '-')) = ?", [strtolower($slug)])
            ->value('category');

        return $existing;
    }

    private function toSlug(string $name): string
    {
        $slug = strtolower(trim($name));
        $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
        return trim($slug, '-');
    }
}