<?php 

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class JobAlertNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $job;
    public $alert;

    public function __construct($job, $alert)
    {
        $this->job = $job;
        $this->alert = $alert;
    }

    public function build()
    {
        return $this->markdown('emails.job-alert')
                    ->subject("🔥 New Match for Alert: {$this->alert->keyword}!");
    }
}