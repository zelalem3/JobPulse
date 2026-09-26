<?php

namespace Tests\Unit;

use App\Models\JobListing;
use App\Models\Skill;
use App\Models\User;
use App\Services\RecommendationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class RecommendationServiceTest extends TestCase
{
    use RefreshDatabase;

    private RecommendationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new RecommendationService();
        Cache::flush(); // avoid cache pollution
    }

    public function test_returns_empty_when_user_has_no_skills(): void
    {
        $user = User::factory()->create();

        $result = $this->service->getRecommendations($user);

        $this->assertTrue($result->isEmpty());
    }

    public function test_returns_jobs_with_matching_skills(): void
    {
        $user = User::factory()->create(['location' => 'Addis Ababa']);
        $skill = Skill::factory()->create(['name' => 'Laravel']);
        $user->skills()->attach($skill);

        $matchingJob = JobListing::factory()->create([
            'title'         => 'Laravel Developer',
            'location'      => 'Addis Ababa',
            'is_active'     => true,
            'posted_at'     => now()->subDay(),
            'deadline'      => now()->addDays(10),
            'quality_score' => 85,
        ]);
        $matchingJob->skills()->attach($skill);

        $nonMatchingJob = JobListing::factory()->create([
            'title'     => 'Marketing Manager',
            'is_active' => true,
            'posted_at' => now()->subDay(),
        ]);

        $result = $this->service->getRecommendations($user);

        $this->assertCount(1, $result);
        $this->assertEquals($matchingJob->id, $result->first()->id);
        $this->assertTrue($result->first()->matched_skills->contains('id', $skill->id));
    }

    public function test_excludes_inactive_and_expired_jobs(): void
    {
        $user = User::factory()->create();
        $skill = Skill::factory()->create();
        $user->skills()->attach($skill);

        JobListing::factory()->create([
            'is_active' => false,
            'posted_at' => now(),
        ])->skills()->attach($skill);

        JobListing::factory()->create([
            'is_active' => true,
            'posted_at' => now(),
            'deadline'  => now()->subDay(), // expired
        ])->skills()->attach($skill);

        $result = $this->service->getRecommendations($user);

        $this->assertTrue($result->isEmpty());
    }

    public function test_calculate_match_returns_correct_score_and_skills(): void
    {
        $user = User::factory()->create();
        $skill1 = Skill::factory()->create(['name' => 'PHP']);
        $skill2 = Skill::factory()->create(['name' => 'Laravel']);
        $skill3 = Skill::factory()->create(['name' => 'AWS']);

        $user->skills()->attach([$skill1->id, $skill2->id]);

        $job = JobListing::factory()->create();
        $job->skills()->attach([$skill1->id, $skill2->id, $skill3->id]);

        $match = $this->service->calculateMatch($user, $job);

        $this->assertEquals(67, $match['match_score']); // 2/3 ≈ 67
        $this->assertCount(2, $match['matched_skills']);
        $this->assertCount(1, $match['missing_skills']);
        $this->assertEquals('AWS', $match['missing_skills']->first()->name);
    }
}