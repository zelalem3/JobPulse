<?php

namespace Tests\Feature;

use App\Models\JobAlert;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AlertApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_alert_and_skill_is_added_without_overwriting(): void
    {
        $user = User::factory()->create();
        $existingSkill = Skill::factory()->create(['name' => 'Python']);
        $user->skills()->attach($existingSkill);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/alerts', [
            'name'     => 'Laravel',
            'location' => 'Addis Ababa',
        ]);

        $response->assertCreated()
            ->assertJsonPath('message', 'Alert and matching skill added successfully.')
            ->assertJsonCount(2, 'skills'); // Python + Laravel

        // Prefer loading the relation explicitly
        $user->load('skills');

        $this->assertCount(2, $user->skills);
        $this->assertTrue($user->skills->contains('name', 'Python'));
        $this->assertTrue($user->skills->contains('name', 'Laravel'));

        $this->assertDatabaseHas('job_alerts', [
            'user_id' => $user->id,
            'keyword' => 'Laravel',
        ]);
    }

    public function test_deleting_alert_does_not_remove_skill(): void
    {
        $user = User::factory()->create();
        $skill = Skill::factory()->create(['name' => 'Laravel']);
        $user->skills()->attach($skill);

        $alert = JobAlert::create([
            'user_id'          => $user->id,
            'keyword'          => 'Laravel',
            'email_enabled'    => true,
            'telegram_enabled' => true,
        ]);

        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/alerts/{$alert->id}");

        $response->assertOk();

        $this->assertDatabaseMissing('job_alerts', ['id' => $alert->id]);

        $user->load('skills'); // explicit load after delete
        $this->assertTrue($user->skills->contains('name', 'Laravel'));
    }

    public function test_guest_cannot_create_alert(): void
    {
        $this->postJson('/api/alerts', ['name' => 'Laravel'])
            ->assertUnauthorized();
    }
}