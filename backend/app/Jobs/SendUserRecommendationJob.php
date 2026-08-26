<?php
namespace App\Jobs;

use App\Models\User;
use App\Services\RecommendationService;
use App\Mail\JobRecommendationsMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendUserRecommendationJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public User $user) {}

    public function handle(RecommendationService $service): void
    {
        $recommendations = $service->getRecommendations($this->user);

        if ($recommendations->isNotEmpty()) {
            Mail::to($this->user->email)->send(
                new JobRecommendationsMail($this->user, $recommendations)
            );
        }
    }
}