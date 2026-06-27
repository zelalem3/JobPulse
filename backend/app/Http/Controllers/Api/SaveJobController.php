<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SavedJob;
use Illuminate\Support\Facades\Auth;

class SaveJobController extends Controller
{
    
    public function index(Request $request, $id)
    {
        $user = $request->user();
      
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

     

      
      
       $new_save = SavedJob::create([
    'user_id' => $user->id,
    'job_listing_id' => $id,
]);

        return response()->json([
            'message' => 'Job saved successfully.',
            'job' => $new_save,
        ], 201);
    }


    public function getSaved()
    {
        $user = Auth::user();
        if (!Auth::check()) {
            return response()->json(['message'=> ''], 0);   
        }
        $saved_job = SavedJob::where('user_id', $user->id);

        return response()->json([
            "message"=>"successfully fetched",
            'savedjobs'=>$saved_job
        ],201);
    }
}