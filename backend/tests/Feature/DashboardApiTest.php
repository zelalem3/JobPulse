<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\JobListing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DashboardApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_stats_returns_counts(): void
    {
        $user = User::factory()->create();
        JobListing::factory()->count(3)->create(['is_active' => true]);
        JobListing::factory()->create(['is_active' => false]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/dashboard/stats');

        $response->assertOk()
            ->assertJsonPath('totalJobs', 4)
            ->assertJsonPath('activeJobs', 3)
            ->assertJsonStructure([
                'totalJobs',
                'totalCompanies',
                'newToday',
                'activeJobs',
            ]);
    }

    public function test_graph_returns_sources_and_weekly_trend(): void
    {
        $user = User::factory()->create();
        JobListing::factory()->create(['source' => 'EthioJobs']);
        JobListing::factory()->create(['source' => 'GeezJobs']);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/dashboard/graph');

        $response->assertOk()
            ->assertJsonStructure([
                'sources',
                'weeklyTrend',
            ])
            ->assertJsonCount(7, 'weeklyTrend'); // last 7 days
    }

    public function test_top_companies_endpoint(): void
    {
        $user = User::factory()->create();
        $company = Company::factory()->create(['name' => 'Acme Corp']);
        JobListing::factory()->count(2)->create([
            'company_id' => $company->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/dashboard/topcompanies');

        $response->assertOk()
            ->assertJsonStructure(['companies']);
    }

    public function test_guest_cannot_access_dashboard_stats(): void
    {
        $this->getJson('/api/dashboard/stats')
            ->assertUnauthorized();
    }
}