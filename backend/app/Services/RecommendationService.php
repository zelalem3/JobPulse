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
        return $user->getRecommendedJobs();
    }
}