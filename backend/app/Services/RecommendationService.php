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
     * 2. Only consider jobs posted in the last 2 days.
     * 3. A job must have at least one matching skill.
     * 4. More matching skills = better recommendation.
     * 5. Job quality is a secondary ranking signal.
     * 6. Matching location is a secondary ranking signal.
     * 7. More recent jobs receive a small ranking boost.
     * 8. Inactive and expired jobs are excluded.
     * 9. Cached with shared Redis invalidation for Python scrapers.
     */
    public function getRecommendations(User $user, int $limit = 8)
{
    /*
    |--------------------------------------------------------------------------
    | Get user skills BEFORE creating the cache key
    |--------------------------------------------------------------------------
    */
    $userSkillIds = $user->skills()
        ->pluck('skills.id')
        ->map(fn ($id) => (int) $id)
        ->unique()
        ->sort()
        ->values();

    /*
    |--------------------------------------------------------------------------
    | Do not recommend unrelated jobs when the user has no skills
    |--------------------------------------------------------------------------
    */
    if ($userSkillIds->isEmpty()) {
        return collect();
    }

    /*
    |--------------------------------------------------------------------------
    | Include skills in cache key
    |--------------------------------------------------------------------------
    */
    $skillsHash = md5($userSkillIds->implode(','));

    $latestJobTimestamp = Cache::get('latest_job_timestamp')
        ?? now()->timestamp;

    $cacheKey = sprintf(
        'job_recommendations:%d:%s:%d:%s:%s',
        $user->id,
        now()->toDateString(),
        $limit,
        $latestJobTimestamp,
        $skillsHash
    );

    return Cache::remember(
        $cacheKey,
        now()->endOfDay(),
        function () use ($user, $userSkillIds, $limit) {

            $matchingSkills = DB::table('job_skill')
                ->select(
                    'job_listing_id',
                    DB::raw(
                        'COUNT(DISTINCT skill_id) AS matching_skills_count'
                    )
                )
                ->whereIn('skill_id', $userSkillIds->toArray())
                ->groupBy('job_listing_id');

            $normalizedLocation = $this->normalizeLocation(
                $user->location
            );

            $query = JobListing::query()
                ->where('job_listings.is_active', true)

                // Jobs posted during the last 2 days
                ->where(
                    'job_listings.posted_at',
                    '>=',
                    now()->subDays(2)->startOfDay()
                )

                // Do not recommend expired jobs
                ->where(function ($query) {
                    $query
                        ->whereNull('job_listings.deadline')
                        ->orWhereDate(
                            'job_listings.deadline',
                            '>=',
                            now()->toDateString()
                        );
                })

                // This guarantees at least one matching skill
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
                                WHEN COALESCE(
                                    job_listings.quality_score, 0
                                ) >= 90 THEN 20

                                WHEN COALESCE(
                                    job_listings.quality_score, 0
                                ) >= 80 THEN 15

                                WHEN COALESCE(
                                    job_listings.quality_score, 0
                                ) >= 70 THEN 10

                                WHEN COALESCE(
                                    job_listings.quality_score, 0
                                ) >= 60 THEN 5

                                ELSE 0
                            END

                            +
                            CASE
                                WHEN LOWER(
                                    TRIM(
                                        COALESCE(
                                            job_listings.location, ''
                                        )
                                    )
                                ) = LOWER(TRIM(?))
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

            $query->addBinding($normalizedLocation, 'select');
            $query->addBinding($normalizedLocation, 'select');
            $query->addBinding(now()->subDay(), 'select');

            $jobs = $query
                ->with(['company', 'skills'])
                ->orderByDesc('recommendation_score')
                ->orderByDesc('matching_skills_count')
                ->orderByDesc('quality_score')
                ->orderByDesc('posted_at')
                ->limit($limit)
                ->get();

            return $jobs->map(function ($job) use ($userSkillIds) {
                $job->matched_skills = $job->skills
                    ->filter(function ($skill) use ($userSkillIds) {
                        return $userSkillIds->contains((int) $skill->id);
                    })
                    ->values();

                return $job;
            });
        }
    );
}

    /**
     * Fallback recommendations when the user has no skills.
     */
    private function getFallbackRecommendations(User $user, int $limit)
    {
        return JobListing::query()
            ->where('is_active', true)
            ->where('posted_at', '>=', now()->subDays(2)->startOfDay())
            ->where(function ($query) {
                $query
                    ->whereNull('deadline')
                    ->orWhereDate('deadline', '>=', now()->toDateString());
            })
            ->with(['company', 'skills'])
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

    private function normalizeLocation(?string $location): string
    {
        if (!$location) {
            return '';
        }

        return strtolower(trim($location));
    }

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