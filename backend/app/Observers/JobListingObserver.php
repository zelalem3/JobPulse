<?php

namespace App\Observers;

use App\Models\JobListing;
use App\Models\JobAlert;
use App\Mail\JobAlertNotification;
use Illuminate\Support\Facades\Mail;

class JobListingObserver
{
    /**
     * Handle the JobListing "created" event.
     */
  public function created(JobListing $jobListing): void
{
    $jobTitle = strtolower($jobListing->title ?? '');
    $jobLocation = strtolower($jobListing->location ?? '');

    $matchingAlerts = JobAlert::where('email_enabled', true)
        ->whereRaw('? LIKE \'%\' || LOWER(keyword) || \'%\'', [$jobTitle])
        ->where(function ($query) use ($jobLocation) {
            $query->whereNull('location')
                  ->orWhere('location', 'Remote')
                  ->orWhereRaw('? LIKE \'%\' || LOWER(location) || \'%\'', [$jobLocation]);
        })
        ->with('user')
        ->get();

    foreach ($matchingAlerts as $alert) {
        if ($alert->user) {
            Mail::to($alert->user->email)
                ->queue(new JobAlertNotification($jobListing, $alert));
        }
    }
}
}