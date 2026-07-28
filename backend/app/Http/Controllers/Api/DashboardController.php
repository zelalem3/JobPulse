<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobListing;
use App\Models\Company;
use App\Models\Skill;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Main dashboard statistics.
     */
    public function stats()
    {
        $today = Carbon::today();

        return response()->json([
            'totalJobs' => JobListing::count(),

            'totalCompanies' => Company::count(),

            'newToday' => JobListing::whereDate(
                'created_at',
                $today
            )->count(),

            'activeJobs' => JobListing::where(
                'is_active',
                true
            )->count(),
        ]);
    }

    /**
     * Job inflow and source distribution.
     */
    public function graph()
    {
        $totalJobs = JobListing::count();

        /*
        |--------------------------------------------------------------------------
        | Job Source Distribution
        |--------------------------------------------------------------------------
        */

        $sources = JobListing::query()
            ->select(
                'source',
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('source')
            ->orderByDesc('total')
            ->get()
            ->map(function ($item) use ($totalJobs) {
                return [
                    'source' => $item->source ?: 'Unknown',
                    'total' => (int) $item->total,
                    'percentage' => $totalJobs > 0
                        ? round(($item->total / $totalJobs) * 100, 1)
                        : 0,
                ];
            })
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Last 7 Days
        |--------------------------------------------------------------------------
        */

        $startDate = Carbon::today()->subDays(6);

        $dailyJobs = JobListing::query()
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total')
            )
            ->whereDate('created_at', '>=', $startDate)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $weeklyTrend = collect();

        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dateKey = $date->format('Y-m-d');

            $weeklyTrend->push([
                'day' => $date->format('D'),
                'date' => $dateKey,
                'total' => isset($dailyJobs[$dateKey])
                    ? (int) $dailyJobs[$dateKey]->total
                    : 0,
            ]);
        }

        return response()->json([
            'sources' => $sources,
            'weeklyTrend' => $weeklyTrend,
        ]);
    }

    /**
     * Most in-demand skills.
     *
     * Assumes job_listings and skills are connected through
     * a many-to-many relationship.
     */
    public function skills()
    {
        $skills = Skill::query()
            ->withCount('jobs')
            ->orderByDesc('jobs_count')
            ->take(10)
            ->get()
            ->map(function ($skill) {
                return [
                    'name' => $skill->name,
                    'count' => (int) $skill->jobs_count,
                ];
            });

        return response()->json([
            'skills' => $skills,
        ]);
    }

    /**
     * Top hiring companies.
     */
    public function topcompanies()
    {
        $companies = Company::query()
            ->withCount('jobs')
            ->orderByDesc('jobs_count')
            ->take(10)
            ->get()
            ->map(function ($company) {
                return [
                    'id' => $company->id,
                    'name' => $company->name,
                    'count' => (int) $company->jobs_count,
                ];
            });

        return response()->json([
            'companies' => $companies,
        ]);
    }
}