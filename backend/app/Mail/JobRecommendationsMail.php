<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection; // Changed from Eloquent\Collection to Support\Collection

class JobRecommendationsMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public Collection $jobs // Now accepts both database collections and processed/mapped support collections
    ) {}

    public function build()
    {
        return $this
            ->subject('Your Personalized Job Recommendations 💼')
            ->view('emails.job-recommendations');
    }
}