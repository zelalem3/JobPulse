<?php

namespace Tests\Unit;

use App\Models\JobAlert;
use App\Models\JobListing;
use App\Models\Skill;
use App\Models\User;
use App\Services\JobMatchingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JobMatchingServiceTest extends TestCase
{
    use RefreshDatabase;

    private JobMatchingService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new JobMatchingService();
    }

    public function test_matches_alert_by_keyword(): void
    {
        $user = User::factory()->create();

        JobAlert::create([
            'user_id'          => $user->id,
            'keyword'          => 'Laravel',
            'location'         => null,
            'email_enabled'    => true,
            'telegram_enabled' => true,
        ]);

        $job = JobListing::factory()->create([
            'title'    => 'Senior Laravel Developer',
            'location' => 'Addis Ababa',
        ]);

        $matches = $this->service->matchAlerts($job);

        $this->assertNotEmpty($matches);
        $this->assertGreaterThanOrEqual(40, $matches[0]['score']);
    }

    public function test_matches_alert_by_location(): void
    {
        $user = User::factory()->create();

        JobAlert::create([
            'user_id'          => $user->id,
            'keyword'          => 'developer',
            'location'         => 'Addis Ababa',
            'email_enabled'    => true,
            'telegram_enabled' => true,
        ]);

        $job = JobListing::factory()->create([
            'title'    => 'Backend Developer',
            'location' => 'Bole, Addis Ababa',
        ]);

        $matches = $this->service->matchAlerts($job);

        $this->assertNotEmpty($matches);
    }

    public function test_ignores_alerts_with_email_disabled(): void
    {
        $user = User::factory()->create();

        JobAlert::create([
            'user_id'          => $user->id,
            'keyword'          => 'Laravel',
            'email_enabled'    => false,
            'telegram_enabled' => true,
        ]);

        $job = JobListing::factory()->create([
            'title' => 'Laravel Developer',
        ]);

        $matches = $this->service->matchAlerts($job);

        $this->assertEmpty($matches);
    }

    public function test_low_score_alerts_are_excluded(): void
    {
        $user = User::factory()->create();

        // Keyword that will not match the job title → low score
        JobAlert::create([
            'user_id'          => $user->id,
            'keyword'          => 'Nurse',
            'location'         => 'Hawassa',
            'email_enabled'    => true,
            'telegram_enabled' => true,
        ]);

        $job = JobListing::factory()->create([
            'title'    => 'Software Engineer',
            'location' => 'Addis Ababa',
        ]);

        $matches = $this->service->matchAlerts($job);

        $this->assertEmpty($matches);
    }

    public function test_remote_location_gives_location_boost(): void
    {
        $user = User::factory()->create();

        JobAlert::create([
            'user_id'          => $user->id,
            'keyword'          => 'engineer',
            'location'         => 'remote',
            'email_enabled'    => true,
            'telegram_enabled' => true,
        ]);

        $job = JobListing::factory()->create([
            'title'    => 'Software Engineer',
            'location' => 'Addis Ababa',
        ]);

        $matches = $this->service->matchAlerts($job);

        $this->assertNotEmpty($matches);
        // keyword (30) + remote location boost (20) = 50
        $this->assertGreaterThanOrEqual(50, $matches[0]['score']);
    }
}