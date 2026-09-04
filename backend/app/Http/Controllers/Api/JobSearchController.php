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
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ILIKE', "%{$search}%")
                    ->orWhere('location', 'ILIKE', "%{$search}%")
                    ->orWhere('description', 'ILIKE', "%{$search}%")
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