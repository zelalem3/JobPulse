<?php

namespace App\Services;

use App\Models\JobListing;
use App\Models\JobAlert;

class JobMatchingService
{
    public function matchAlerts(JobListing $job): array
    {
        $jobTitle = strtolower($job->title);
        $jobLocation = strtolower($job->location ?? '');
        $jobSkills = $job->skills ?? [];

        $alerts = JobAlert::with('user')
            ->where('email_enabled', true)
            ->get();

        $matches = [];

        foreach ($alerts as $alert) {

            $score = 0;

            // 1. Keyword match (30 points)
            if (str_contains($jobTitle, strtolower($alert->keyword))) {
                $score += 30;
            }

            // 2. Location match (20 points)
            if ($alert->location) {
                if (
                    str_contains($jobLocation, strtolower($alert->location)) ||
                    strtolower($alert->location) === 'remote'
                ) {
                    $score += 20;
                }
            } else {
                $score += 10; // neutral boost
            }

            // 3. Skill matching (50 points)
            if (!empty($jobSkills) && $alert->user->skills) {

                $userSkills = array_map('strtolower', $alert->user->skills);
                $jobSkillsLower = array_map('strtolower', $jobSkills);

                $matchedSkills = array_intersect($userSkills, $jobSkillsLower);

                $skillScore = (count($matchedSkills) / max(count($jobSkillsLower), 1)) * 50;

                $score += $skillScore;
            }

            // Only keep good matches
            if ($score >= 40) {
                $matches[] = [
                    'alert' => $alert,
                    'score' => round($score),
                ];
            }
        }

        return $matches;
    }
}