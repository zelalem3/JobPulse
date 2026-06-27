<?php

namespace App\Mail;

use App\Models\JobListing;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class JobAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public JobListing $job
    ) {}

    public function build()
    {
        return $this
            ->subject('New Job Match Found!')
            ->view('emails.job-alert');
    }
}