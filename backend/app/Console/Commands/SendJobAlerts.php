<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use App\Models\JobAlert;
use App\Models\JobListing;
use App\Mail\JobAlertMail;



#[Signature('app:send-job-alerts')]
#[Description('Command description')]
class SendJobAlerts extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {

        $alerts = JobAlert::with('user')->get();

foreach ($alerts as $alert) {
    $jobs = JobListing::query()
        ->when($alert->keyword, function ($q) use ($alert) {
            $q->where('title', 'ILIKE', "%{$alert->keyword}%");
        })
        ->when($alert->location, function ($q) use ($alert) {
            $q->where('location', 'ILIKE', "%{$alert->location}%");
        })
        ->when($alert->category, function ($q) use ($alert) {
            $q->where('category', $alert->category);
        })
        ->where(
            'created_at',
            '>',
            $alert->last_checked_at ?? now()->subDay()
        )
        ->get();

    foreach ($jobs as $job) {
        if ($alert->email_enabled) {
            Mail::to($alert->user->email)
                ->queue(new JobAlertMail($job));
        }
    }

    $alert->update([
        'last_checked_at' => now(),
    ]);
}
    }
}
