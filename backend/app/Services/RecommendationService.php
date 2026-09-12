<?php

namespace App\Services;

use App\Models\User;
use App\Models\JobListing;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

class RecommendationService
{
    /**
     * Get personalized job recommendations for a user.
     *
     * Matching rules:
     * 1. Match user skills against job skills using skill IDs.
     * 2. Restrict matching strictly to jobs posted today.
     * 3. A job must have at least one matching skill.
     * 4. More matching skills = better recommendation.
     * 5. Job quality is a secondary ranking signal.
     * 6. Matching location is a secondary ranking signal.
     * 7. Recent jobs receive a small ranking boost.
     * 8. Inactive and expired jobs are excluded.
     * 9. Cached with shared Redis invalidation for Python scrapers.
     */
    public function getRecommendations(User $user, int $limit = 10)
    {
        /*
         * ---------------------------------------------------------
         * Cache Key Invalidation via Shared Redis
         * ---------------------------------------------------------
         * Fetches the latest global job timestamp updated by Python.
         * If Python inserts a new job, this value changes, instantly 
         * invalidating recommendation caches for all users.
         */
        $latestJobTimestamp = Redis::get('latest_job_timestamp') ?? now()->timestamp;

        $cacheKey = sprintf(
            'job_recommendations:%d:%s:%d:%s',
            $user->id,
            now()->toDateString(),
            $limit,
            $latestJobTimestamp
        );

        return Cache::remember($cacheKey, now()->endOfDay(), function () use ($user, $limit) {
            
            /*
             * Get the user's skill IDs
             */
            $userSkillIds = $user->skills()
                ->pluck('skills.id')
                ->unique()
                ->values()
                ->toArray();

            /*
             * No skills -> return fallback recommendations (jobs posted today)
             */
            if (empty($userSkillIds)) {
                return $this->getFallbackRecommendations(
                    $user,
                    $limit
                );
            }

            /*
             * Matching skills count
             */
            $matchingSkills = DB::table('job_skill')
                ->select(
                    'job_listing_id',
                    DB::raw('COUNT(DISTINCT skill_id) AS matching_skills_count')
                )
                ->whereIn('skill_id', $userSkillIds)
                ->groupBy('job_listing_id');

            /*
             * Main recommendation query
             */
            $query = JobListing::query()
                ->where('job_listings.is_active', true)

                /*
                 * Restrict matching strictly to jobs posted today.
                 */
                ->whereDate('job_listings.posted_at', now()->toDateString())

                /*
                 * Don't recommend expired jobs.
                 */
                ->where(function ($query) {
                    $query
                        ->whereNull('job_listings.deadline')
                        ->orWhereDate(
                            'job_listings.deadline',
                            '>=',
                            now()->toDateString()
                        );
                })

                /*
                 * Join jobs that have at least one matching user skill.
                 */
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
                    DB::raw("
                        (
                            matching.matching_skills_count * 10
                            +
                            CASE
                                WHEN matching.matching_skills_count >= 4
                                    THEN 15
                                WHEN matching.matching_skills_count = 3
                                    THEN 10
                                WHEN matching.matching_skills_count = 2
                                    THEN 5
                                ELSE 0
                            END
                            +
                            CASE
                                WHEN COALESCE(job_listings.quality_score, 0) >= 90
                                    THEN 20
                                WHEN COALESCE(job_listings.quality_score, 0) >= 80
                                    THEN 15
                                WHEN COALESCE(job_listings.quality_score, 0) >= 70
                                    THEN 10
                                WHEN COALESCE(job_listings.quality_score, 0) >= 60
                                    THEN 5
                                ELSE 0
                            END
                            +
                            CASE
                                WHEN LOWER(TRIM(COALESCE(job_listings.location, '')))
                                    =
                                     LOWER(TRIM(?))
                                    AND TRIM(?) <> ''
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
                ]);

            $normalizedLocation = $this->normalizeLocation(
                $user->location
            );

            $query->addBinding($normalizedLocation, 'select');
            $query->addBinding($normalizedLocation, 'select');
            $query->addBinding(now()->subDays(7), 'select');

            $query->with([
                'company',
                'skills',
            ]);

            $jobs = $query
                ->orderByDesc('recommendation_score')
                ->orderByDesc('matching_skills_count')
                ->orderByDesc('quality_score')
                ->orderByDesc('posted_at')
                ->limit($limit)
                ->get();

            return $jobs->map(function ($job) use ($userSkillIds) {
                $job->matched_skills = $job->skills
                    ->filter(function ($skill) use ($userSkillIds) {
                        return in_array(
                            $skill->id,
                            $userSkillIds,
                            true
                        );
                    })
                    ->values();

                return $job;
            });
        });
    }

    /**
     * Fallback recommendations when the user has no skills.
     * Fetches active jobs posted today.
     */
    private function getFallbackRecommendations(
        User $user,
        int $limit
    ) {
        return JobListing::query()
            ->where('is_active', true)
            ->whereDate('posted_at', now()->toDateString())
            ->where(function ($query) {
                $query
                    ->whereNull('deadline')
                    ->orWhereDate(
                        'deadline',
                        '>=',
                        now()->toDateString()
                    );
            })
            ->with([
                'company',
                'skills',
            ])
            ->latest('posted_at')
            ->limit($limit)
            ->get()
            ->map(function ($job) {
                $job->matching_skills_count = 0;
                $job->recommendation_score = 0;
                $job->matched_skills = collect();

                return $job;
            });
    }

    /**
     * Normalize a user's location before comparing it.
     */
    private function normalizeLocation(?string $location): string
    {
        if (!$location) {
            return '';
        }

        return strtolower(
            trim($location)
        );
    }

    /**
     * Calculate individual match percentages between a user and a job.
     */
    public function calculateMatch(User $user, JobListing $job): array
    {
        $userSkills = $user->skills()->get();
        $jobSkills = $job->skills()->get();

        $userSkillIds = $userSkills->pluck('id');
        $jobSkillIds = $jobSkills->pluck('id');

        $matchingSkillIds = $userSkillIds->intersect($jobSkillIds);

        $matchedSkills = $jobSkills->whereIn('id', $matchingSkillIds);

        $missingSkills = $jobSkills->whereNotIn('id', $matchingSkillIds);

        $score = $jobSkills->count() > 0
            ? round(($matchedSkills->count() / $jobSkills->count()) * 100)
            : 0;

        return [
            'match_score' => $score,
            'matched_skills' => $matchedSkills->values(),
            'missing_skills' => $missingSkills->values(),
        ];
    }
}