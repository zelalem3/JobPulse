<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobListing;  
use App\Models\Company;   
use App\Models\Skill;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
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

    public function graph(){

    }

    public function topcompanies(){
        $topcompanies = JobListing::where('', true)->count();
    }
}