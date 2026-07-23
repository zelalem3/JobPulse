<?php

namespace App\Services;

use App\Models\User;
use App\Models\JobListing;
use Illuminate\Support\Facades\DB;

class RecommendationService
{
    public function getRecommendations(User $user)
    {
        $userSkills = $user->skills()
            ->pluck('name')
            ->map(fn ($skill) => strtolower($skill))
            ->toArray();

        if (empty($userSkills)) {
            return JobListing::latest()->take(10)->get();
        }

        return JobListing::query()
            ->whereHas('skills', function ($q) use ($userSkills) {
                $q->whereIn(DB::raw('LOWER(name)'), $userSkills);
            })
            ->withCount([
                'skills as matching_skills_count' => function ($q) use ($userSkills) {
                    $q->whereIn(DB::raw('LOWER(name)'), $userSkills);
                }
            ])
            ->orderByDesc('matching_skills_count')
            ->latest()
            ->get();
    }
}