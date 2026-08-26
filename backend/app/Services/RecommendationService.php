<?php

namespace App\Services;

use App\Models\User;
use App\Models\JobListing;
use Illuminate\Support\Facades\DB;

class RecommendationService
{
    /**
     * Get personalized job recommendations for a user.
     *
     * Matching rules:
     *
     * 1. Match user skills against job skills using skill IDs.
     * 2. A job must have at least one matching skill.
     * 3. More matching skills = better recommendation.
     * 4. Job quality is a secondary ranking signal.
     * 5. Matching location is a secondary ranking signal.
     * 6. Recent jobs receive a small ranking boost.
     * 7. Inactive and expired jobs are excluded.
     * 8. Return matched skills so the frontend can explain
     *    why the job was recommended.
     */
    public function getRecommendations(User $user, int $limit = 10)
    {
        /*
         * ---------------------------------------------------------
         * Get the user's skill IDs
         * ---------------------------------------------------------
         *
         * Example:
         *
         * [
         *     97,    // Python
         *     132,   // React
         *     8130,  // Junior Developer
         * ]
         *
         * We deliberately match by ID rather than skill name.
         */
        $userSkillIds = $user->skills()
            ->pluck('skills.id')
            ->unique()
            ->values()
            ->toArray();

        /*
         * ---------------------------------------------------------
         * No skills
         * ---------------------------------------------------------
         *
         * There is no meaningful skill-based recommendation if
         * the user has no skills.
         *
         * In this case, return recent active jobs instead.
         */
        if (empty($userSkillIds)) {
            return $this->getFallbackRecommendations(
                $user,
                $limit
            );
        }

        /*
         * ---------------------------------------------------------
         * Matching skills
         * ---------------------------------------------------------
         *
         * Count how many of the user's skills each job contains.
         *
         * Example:
         *
         * User:
         *   Python
         *   React
         *   Junior Developer
         *
         * Job A:
         *   React
         *
         * matching_skills_count = 1
         *
         * Job B:
         *   Python
         *   React
         *
         * matching_skills_count = 2
         *
         * Job B ranks higher.
         */
        $matchingSkills = DB::table('job_skill')
            ->select(
                'job_listing_id',
                DB::raw('COUNT(DISTINCT skill_id) AS matching_skills_count')
            )
            ->whereIn('skill_id', $userSkillIds)
            ->groupBy('job_listing_id');

        /*
         * ---------------------------------------------------------
         * Main recommendation query
         * ---------------------------------------------------------
         */
        $query = JobListing::query()
            ->where('job_listings.is_active', true)

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
             * Join only jobs that have at least one matching
             * user skill.
             *
             * This is important:
             *
             * We do NOT fetch all jobs and calculate matching
             * inside PHP.
             *
             * PostgreSQL does the filtering and counting.
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

            /*
             * Select the normal job fields plus our matching
             * metadata.
             */
            ->select([
                'job_listings.*',

                'matching.matching_skills_count',

                /*
                 * -------------------------------------------------
                 * Recommendation score
                 * -------------------------------------------------
                 *
                 * Matching skills are the strongest signal.
                 *
                 * 1 match  = 10 points
                 * 2 matches = 20 points
                 * 3 matches = 30 points
                 * etc.
                 *
                 * Then:
                 *
                 * + quality
                 * + location
                 * + recency
                 */
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

        /*
         * ---------------------------------------------------------
         * Bind recommendation parameters
         * ---------------------------------------------------------
         */
        $normalizedLocation = $this->normalizeLocation(
            $user->location
        );

        /*
         * Location is intentionally only a bonus.
         *
         * A matching skill should never be rejected simply
         * because the job is in another location.
         */
        $query->addBinding(
            $normalizedLocation,
            'select'
        );

        $query->addBinding(
            $normalizedLocation,
            'select'
        );

        /*
         * Recent-job bonus.
         *
         * Jobs from the last 7 days receive the recency bonus.
         */
        $query->addBinding(
            now()->subDays(7),
            'select'
        );

        /*
         * ---------------------------------------------------------
         * Load relationships
         * ---------------------------------------------------------
         *
         * We load skills so the API can return:
         *
         * matched_skills
         *
         * and the complete job skill list.
         */
        $query->with([
            'company',
            'skills',
        ]);

        /*
         * ---------------------------------------------------------
         * Ranking
         * ---------------------------------------------------------
         *
         * Priority:
         *
         * 1. Overall recommendation score
         * 2. Number of matching skills
         * 3. Quality score
         * 4. Most recent job
         */
        $jobs = $query
            ->orderByDesc('recommendation_score')
            ->orderByDesc('matching_skills_count')
            ->orderByDesc('quality_score')
            ->orderByDesc('posted_at')
            ->limit($limit)
            ->get();

        /*
         * ---------------------------------------------------------
         * Attach matched skills
         * ---------------------------------------------------------
         *
         * The frontend can now display:
         *
         * "Matched skills: React, Python"
         *
         * instead of just showing a score.
         */
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
    }

    /**
     * Fallback recommendations when the user has no skills.
     *
     * We don't pretend these are skill matches.
     * They are simply the newest active jobs.
     */
    private function getFallbackRecommendations(
        User $user,
        int $limit
    ) {
        return JobListing::query()
            ->where('is_active', true)

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
}
