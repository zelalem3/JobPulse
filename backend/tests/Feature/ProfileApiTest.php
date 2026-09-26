<?php

namespace Tests\Feature;

use App\Models\Skill;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_profile(): void
    {
        $user = User::factory()->create([
            'name'     => 'Zelalem',
            'location' => 'Addis Ababa',
        ]);
        $skill = Skill::factory()->create(['name' => 'Laravel']);
        $user->skills()->attach($skill);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/profile');

        $response->assertOk()
            ->assertJsonPath('name', 'Zelalem')
            ->assertJsonPath('location', 'Addis Ababa')
            ->assertJsonCount(1, 'skills');
    }

    public function test_updating_name_does_not_touch_skills(): void
    {
        $user = User::factory()->create(['name' => 'Old Name']);
        $skill = Skill::factory()->create(['name' => 'Python']);
        $user->skills()->attach($skill);

        Sanctum::actingAs($user);

        $response = $this->putJson('/api/profile', [
            'name' => 'New Name',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Profile updated successfully.')
            ->assertJsonPath('user.name', 'New Name')
            ->assertJsonCount(1, 'user.skills'); // skills preserved in response

        // DB-level check (avoids null relation attribute)
        $this->assertEquals(1, $user->skills()->count());
        $this->assertTrue(
            $user->skills()->where('name', 'Python')->exists()
        );
    }

    public function test_updating_skills_replaces_the_list(): void
    {
        $user = User::factory()->create();
        $oldSkill = Skill::factory()->create(['name' => 'PHP']);
        $user->skills()->attach($oldSkill);

        Sanctum::actingAs($user);

        $response = $this->putJson('/api/profile', [
            'skills' => ['Laravel', 'React'],
        ]);

        $response->assertOk()
            ->assertJsonCount(2, 'user.skills');

        $this->assertEquals(2, $user->skills()->count());
        $this->assertTrue($user->skills()->where('name', 'Laravel')->exists());
        $this->assertTrue($user->skills()->where('name', 'React')->exists());
        $this->assertFalse($user->skills()->where('name', 'PHP')->exists());
    }

    public function test_user_can_update_password(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('password'),
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson('/api/profile/password', [
            'current_password'      => 'password',
            'password'              => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Password updated successfully!');
    }

    public function test_guest_cannot_view_profile(): void
    {
        $this->getJson('/api/profile')
            ->assertUnauthorized();
    }
}