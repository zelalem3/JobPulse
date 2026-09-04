<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobListing;
use Illuminate\Http\Request;

class JobSearchController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'q' => 'nullable|string|max:255',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $search = trim((string) $request->input('q', ''));
        $perPage = $request->input('per_page', 10);

        $query = JobListing::with(['company', 'skills']);

        if ($search !== '') {
            // Convert search terms into a PostgreSQL tsquery format (e.g., "front end" becomes "front & end")
            $searchTerms = collect(explode(' ', $search))
                ->filter()
                ->map(fn($term) => trim($term) . ':*')
                ->implode(' & ');

            $query->where(function ($q) use ($search, $searchTerms) {
                // Use PostgreSQL full-text search matching the GIN index
                $q->whereRaw("to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'')) @@ to_tsquery('english', ?)", [$searchTerms])
                  // Fallback regular ILIKE lookups for location, source, and company name
                  ->orWhere('location', 'ILIKE', "%{$search}%")
                  ->orWhere('source', 'ILIKE', "%{$search}%")
                  ->orWhereHas('company', function ($companyQuery) use ($search) {
                      $companyQuery->where('name', 'ILIKE', "%{$search}%");
                  });
            });
        }

        $jobs = $query
            ->latest('posted_at')
            ->paginate($perPage);

        return response()->json($jobs);
    }
}