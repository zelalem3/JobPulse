<?php

namespace Tests\Feature;

use App\Models\JobListing;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RecommendationApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_authenticated_user_gets_recommendations(): void
    {
        $user = User::factory()->create(['location' => 'Addis Ababa']);
        $skill = Skill::factory()->create(['name' => 'Laravel']);
        $user->skills()->attach($skill);

        $job = JobListing::factory()->create([
            'location'      => 'Addis Ababa',
            'is_active'     => true,
            'posted_at'     => now()->subHours(12),
            'deadline'      => now()->addWeek(),
            'quality_score' => 90,
        ]);
        $job->skills()->attach($skill);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/recommendations');

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $job->id);
    }

    public function test_user_with_no_skills_gets_empty_recommendations(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->getJson('/api/recommendations')
            ->assertOk()
            ->assertExactJson([]);
    }

    public function test_guest_cannot_access_recommendations(): void
    {
        $this->getJson('/api/recommendations')
            ->assertUnauthorized();
    }

    public function test_calculate_match_endpoint(): void
    {
        $user = User::factory()->create();
        $skill1 = Skill::factory()->create(['name' => 'PHP']);
        $skill2 = Skill::factory()->create(['name' => 'Laravel']);
        $skill3 = Skill::factory()->create(['name' => 'AWS']);

        $user->skills()->attach([$skill1->id, $skill2->id]);

        $job = JobListing::factory()->create();
        $job->skills()->attach([$skill1->id, $skill2->id, $skill3->id]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/job/recommendation/{$job->id}");

        $response->assertOk()
            ->assertJsonPath('match_score', 67)
            ->assertJsonCount(2, 'matched_skills')
            ->assertJsonCount(1, 'missing_skills');
    }
}