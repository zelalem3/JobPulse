<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobListing;  
use App\Models\Company;   
use App\Models\Skill;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function graph()
    {
        $totalJobs = JobListing::count();

        // 1. Job Source Distribution (for percentage breakdown bars)
        $rawSources = JobListing::select('source', DB::raw('count(*) as total'))
            ->groupBy('source')
            ->get();

        $sources = $rawSources->map(function ($item) use ($totalJobs) {
            return [
                'source' => $item->source ?: 'Direct Board',
                'total' => $item->total,
                'percentage' => $totalJobs > 0 ? round(($item->total / $totalJobs) * 100) : 0,
            ];
        });

        // 2. Weekly Inflow Trend (Last 7 Days activity for trend chart)
        $weeklyTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $count = JobListing::whereDate('created_at', $date->format('Y-m-d'))->count();
            
            $weeklyTrend[] = [
                'day' => $date->format('D'), // Mon, Tue, Wed, etc.
                'date' => $date->format('Y-m-d'),
                'total' => $count,
            ];
        }

        return response()->json([
            'sources' => $sources,
            'weeklyTrend' => $weeklyTrend,
        ]);
    }

    public function stats()
    {
        $totaljobs = JobListing::count();
        $totalcompanies = Company::count();
        $newtoday = JobListing::whereDate('created_at', Carbon::today()->toDateString())->count();
        $activejobs = JobListing::where('is_active', true)->count();

        return response()->json([
            'totalJobs' => $totaljobs,
            'totalCompanies' => $totalcompanies,
            'newToday' => $newtoday,
            'activeJobs' => $activejobs,
        ]);
    }


    public function skills(){
        $skills = Skill::groupBy('name');
        return response()->json([
            'skills stats'=> $skills,
            'count'=> $skills->count(),
            ]);

    }

    

    public function topcompanies()
{
   
    $topcompanies = Company::withCount('jobs')
        ->orderBy('jobs_count', 'desc')
        ->take(10) 
        ->get();

    return response()->json([
        'companies' => $topcompanies
    ]);
}

}