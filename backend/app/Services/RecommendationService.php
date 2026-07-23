<?php

namespace App\Services;

use App\Models\User;

class RecommendationService
{
    /**
     * Get tailored job listings for a specific user.
     */
    public function getRecommendations(User $user)
    {
        $userSkills = $user->skills()->pluck('skills.id')->toArray();

        if (empty($userSkills)) {
            return \App\Models\JobListing::latest()->take(10)->get();
        }

        return \App\Models\JobListing::query()
            ->whereHas('skills', function ($q) use ($userSkills) {
                $q->whereIn('skills.id', $userSkills);
            })
            ->withCount(['skills as matching_skills_count' => function ($q) use ($userSkills) {
                $q->whereIn('skills.id', $userSkills);
            }])
            ->orderByDesc('matching_skills_count')
            ->latest()
            ->get();
    }
}