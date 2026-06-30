<?php

namespace App\Observers;

use App\Models\JobListing;
use App\Models\JobAlert;
use App\Mail\JobAlertNotification;
use Illuminate\Support\Facades\Mail;
use App\Mail\JobAlertMail;

class JobListingObserver
{
    /**
     * Handle the JobListing "created" event.
     */
  
public function created(JobListing $job)
{
    try {
        \Log::info('Observer fired: '.$job->title);

        $jobTitle = strtolower($job->title);

        $alerts = JobAlert::with('user')
            ->where('email_enabled', true)
            ->get()
            ->filter(function ($alert) use ($jobTitle) {
                return str_contains(
                    $jobTitle,
                    strtolower($alert->keyword)
                );
            });

        \Log::info('Matching alerts count: '.$alerts->count());

        foreach ($alerts as $alert) {
            \Log::info('Sending to: '.$alert->user->email);

            Mail::to($alert->user->email)
                ->send(new JobAlertMail($job));
        }
    } catch (\Throwable $e) {
        \Log::error($e->getMessage());
        \Log::error($e->getFile().':'.$e->getLine());
    }
} 
}
