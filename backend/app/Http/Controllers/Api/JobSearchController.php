<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobListing;
use Illuminate\Http\Request;

class JobSearchController extends Controller
{
    /**
     * Search jobs across title, company, location and description.
     */
    public function search(Request $request)
    {
        $request->validate([
            'q' => 'nullable|string|max:255',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $search = trim((string) $request->input('q', ''));
        $perPage = $request->input('per_page', 10);

        $query = JobListing::with('skills');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('source', 'like', "%{$search}%");
            });
        }

        $jobs = $query
            ->latest('scraped_at')
            ->paginate($perPage);

        return response()->json($jobs);
    }
}