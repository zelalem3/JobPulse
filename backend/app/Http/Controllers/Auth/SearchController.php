<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobListing;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Search job listings and resources.
     */
    public function __invoke(Request $request)
    {
        $query = $request->input('q', '');

        $jobs = JobListing::query()
            ->when($query, function ($qBuilder, $searchTerm) {
                $qBuilder->where('title', 'ilike', "%{$searchTerm}%")
                    ->orWhere('company', 'ilike', "%{$searchTerm}%")
                    ->orWhere('description', 'ilike', "%{$searchTerm}%")
                    ->orWhereHas('skills', function ($skillQuery) use ($searchTerm) {
                        $skillQuery->where('name', 'ilike', "%{$searchTerm}%");
                    });
            })
            ->with('skills')
            ->latest()
            ->paginate(15);

        return response()->json([
            'query' => $query,
            'results' => $jobs,
        ]);
    }
}