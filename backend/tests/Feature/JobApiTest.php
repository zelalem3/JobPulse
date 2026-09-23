<?php

namespace Tests\Feature;

use App\Models\Job;
use Tests\TestCase;

class JobsApiTest extends TestCase
{
    public function test_jobs_can_be_filtered_by_location(): void
    {
        Job::factory()->create(['location' => 'Addis Ababa']);
        Job::factory()->create(['location' => 'Remote']);

        $response = $this->getJson('/api/jobs?location=Addis%20Ababa');

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }
}