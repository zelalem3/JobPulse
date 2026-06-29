<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\JobListing;

class RecommendationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
{
    $user = $request->user();

    $userSkills = collect(
        $user->skills ?? []
    )->map(fn ($skill) =>
        strtolower(trim($skill))
    );

    $jobs = JobListing::with('skills')
        ->where('is_active', true)
        ->latest()
        ->get();

    $recommendations = [];

    foreach ($jobs as $job) {

        $jobSkills =
            $job->skills
                ->pluck('name')
                ->map(fn ($skill) =>
                    strtolower(trim($skill))
                );

        $matchedSkills =
            $userSkills
                ->intersect($jobSkills);

        $score = 0;

        if ($jobSkills->count() > 0) {
            $score =
                (
                    $matchedSkills->count() /
                    $jobSkills->count()
                ) * 80;
        }

        $locationMatch = false;

        if (
            $user->location &&
            $job->location
        ) {
            $locationMatch =
                str_contains(
                    strtolower($job->location),
                    strtolower($user->location)
                );
        }

        if (
            !$locationMatch &&
            $job->location
        ) {
            $locationMatch =
                str_contains(
                    strtolower($job->location),
                    'remote'
                );
        }

        if ($locationMatch) {
            $score += 20;
        }

        $recommendations[] = [
            'job' => $job,
            'score' => round($score),
            'matched_skills' =>
                $matchedSkills->values(),
            'missing_skills' =>
                $jobSkills
                    ->diff($userSkills)
                    ->values(),
            'location_match' =>
                $locationMatch,
        ];
    }

    return response()->json(
        collect($recommendations)
            ->sortByDesc('score')
            ->take(20)
            ->values()
    );
}

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
