<?php

namespace Tests\Feature;

use App\Models\JobListing;
use App\Models\SavedJob;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SavedJobApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_save_a_job(): void
    {
        $user = User::factory()->create();
        $job = JobListing::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/savejob/{$job->id}");

        $response->assertCreated()
            ->assertJsonPath('message', 'Job saved successfully.')
            ->assertJsonPath('isSaved', true);

        $this->assertDatabaseHas('saved_jobs', [
            'user_id'        => $user->id,
            'job_listing_id' => $job->id,
        ]);
    }

    public function test_saving_again_unsaves_the_job(): void
    {
        $user = User::factory()->create();
        $job = JobListing::factory()->create();

        SavedJob::create([
            'user_id'        => $user->id,
            'job_listing_id' => $job->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/savejob/{$job->id}");

        $response->assertOk()
            ->assertJsonPath('message', 'Job unsaved successfully.')
            ->assertJsonPath('isSaved', false);

        $this->assertDatabaseMissing('saved_jobs', [
            'user_id'        => $user->id,
            'job_listing_id' => $job->id,
        ]);
    }

    public function test_user_can_list_saved_jobs(): void
    {
        $user = User::factory()->create();
        $job = JobListing::factory()->create();

        SavedJob::create([
            'user_id'        => $user->id,
            'job_listing_id' => $job->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/savedjobs');

        $response->assertOk()
            ->assertJsonPath('message', 'successfully fetched')
            ->assertJsonCount(1, 'savedjobs');
    }

    public function test_user_can_explicitly_delete_saved_job(): void
    {
        $user = User::factory()->create();
        $job = JobListing::factory()->create();

        $saved = SavedJob::create([
            'user_id'        => $user->id,
            'job_listing_id' => $job->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/savejob/{$job->id}");

        $response->assertOk()
            ->assertJsonPath('isSaved', false);

        $this->assertDatabaseMissing('saved_jobs', ['id' => $saved->id]);
    }

    public function test_guest_cannot_save_jobs(): void
    {
        $job = JobListing::factory()->create();

        $this->postJson("/api/savejob/{$job->id}")
            ->assertUnauthorized();
    }
}