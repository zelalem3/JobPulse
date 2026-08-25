<?php

namespace App\Services;

use App\Models\User;
use App\Models\JobListing;
use Illuminate\Support\Facades\DB;

class RecommendationService
{
    public function getRecommendations(User $user)
    {
        $userSkillIds = $user->skills()
            ->pluck('skills.id')
            ->toArray();

        /*
         * If the user has no skills, return the newest active jobs.
         */
        if (empty($userSkillIds)) {
            return JobListing::query()
                ->where('is_active', true)
                ->where(function ($query) {
                    $query->whereNull('deadline')
                        ->orWhereDate('deadline', '>=', now()->toDateString());
                })
                ->with(['company', 'skills'])
                ->latest('posted_at')
                ->take(10)
                ->get();
        }

        /*
         * Calculate the number of matching skills for every job.
         */
        $matchingSkills = DB::table('job_skill')
            ->select(
                'job_listing_id',
                DB::raw('COUNT(*) as matching_skills_count')
            )
            ->whereIn('skill_id', $userSkillIds)
            ->groupBy('job_listing_id');

        $query = JobListing::query()
            ->where('job_listings.is_active', true)

            // Don't recommend expired jobs
            ->where(function ($query) {
                $query->whereNull('job_listings.deadline')
                    ->orWhereDate(
                        'job_listings.deadline',
                        '>=',
                        now()->toDateString()
                    );
            })

            // Only jobs with at least one matching skill
            ->joinSub(
                $matchingSkills,
                'matching',
                function ($join) {
                    $join->on(
                        'job_listings.id',
                        '=',
                        'matching.job_listing_id'
                    );
                }
            )

            ->select([
                'job_listings.*',

                'matching.matching_skills_count',

                /*
                 * Final recommendation score.
                 */
                DB::raw("
                    (
                        (matching.matching_skills_count * 10)

                        +

                        CASE
                            WHEN matching.matching_skills_count >= 3
                                THEN 10
                            WHEN matching.matching_skills_count >= 2
                                THEN 5
                            ELSE 0
                        END

                        +

                        CASE
                            WHEN job_listings.quality_score >= 90
                                THEN 20
                            WHEN job_listings.quality_score >= 80
                                THEN 15
                            WHEN job_listings.quality_score >= 70
                                THEN 10
                            WHEN job_listings.quality_score >= 60
                                THEN 5
                            ELSE 0
                        END

                        +

                        CASE
                            WHEN LOWER(COALESCE(job_listings.location, ''))
                                = LOWER(?)
                                THEN 10
                            ELSE 0
                        END

                        +

                        CASE
                            WHEN job_listings.posted_at >= ?
                                THEN 10
                            ELSE 0
                        END
                    ) AS recommendation_score
                ")
            ])

            ->addBinding(
                $this->normalizeLocation($user->location),
                'select'
            )

            ->addBinding(
                now()->subDays(7),
                'select'
            )

            ->with([
                'company',
                'skills'
            ])

            ->orderByDesc('recommendation_score')
            ->orderByDesc('matching_skills_count')
            ->orderByDesc('quality_score')
            ->orderByDesc('posted_at')
            ->take(10);

        return $query->get();
    }

    private function normalizeLocation(?string $location): string
    {
        if (!$location) {
            return '';
        }

        return strtolower(trim($location));
    }
}