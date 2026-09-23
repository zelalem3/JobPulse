<?php

namespace Tests\Feature;

use App\Models\JobListing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JobApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_fetch_paginated_jobs(): void
    {
        $user = User::factory()->create();

        JobListing::factory()->count(15)->create();

        $response = $this
            ->actingAs($user)
            ->getJson('/api/jobs?per_page=10');

        $response
            ->assertOk()
            ->assertJsonCount(10, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'title',
                        'company',
                        'location',
                        'created_at',
                    ],
                ],
                'links',
                'meta',
            ]);
    }
}