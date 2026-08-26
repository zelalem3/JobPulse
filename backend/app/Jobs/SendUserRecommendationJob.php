<?php

namespace App\Jobs;

use App\Mail\JobRecommendationsMail;
use App\Models\User;
use App\Services\RecommendationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class SendUserRecommendationJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    /**
     * Maximum number of attempts.
     */
    public int $tries = 3;

    /**
     * Number of seconds before retrying.
     */
    public array $backoff = [
        30,
        120,
        300,
    ];

    /**
     * Maximum execution time.
     */
    public int $timeout = 120;

    /**
     * User ID only.
     */
    public function __construct(
        public int $userId
    ) {
        $this->onQueue('recommendations');
    }

    /**
     * Prevent the same user's recommendation job from
     * running concurrently.
     */
    public function middleware(): array
    {
        return [
            new WithoutOverlapping(
                'recommendation-user-' . $this->userId
            ),
        ];
    }

    /**
     * Execute the recommendation job.
     */
    public function handle(
        RecommendationService $recommendationService
    ): void {
        $user = User::find($this->userId);

        if (!$user) {
            Log::warning(
                'Recommendation skipped: user not found.',
                [
                    'user_id' => $this->userId,
                ]
            );

            return;
        }

        try {
            $recommendations =
                $recommendationService->getRecommendations($user);

            if ($recommendations->isEmpty()) {
                Log::info(
                    'No recommendations found for user.',
                    [
                        'user_id' => $user->id,
                        'email' => $user->email,
                    ]
                );

                return;
            }

            // Send the recommendations email
            Mail::to($user->email)->send(
                new JobRecommendationsMail(
                    $user,
                    $recommendations
                )
            );

            Log::info(
                'Recommendations generated and email sent successfully.',
                [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'count' => $recommendations->count(),
                ]
            );

        } catch (Throwable $e) {

            Log::error(
                'Failed to generate or send recommendations.',
                [
                    'user_id' => $this->userId,
                    'error' => $e->getMessage(),
                ]
            );

            throw $e;
        }
    }

    /**
     * Handle a permanently failed job.
     */
    public function failed(Throwable $exception): void
    {
        Log::error(
            'Recommendation job permanently failed.',
            [
                'user_id' => $this->userId,
                'error' => $exception->getMessage(),
            ]
        );
    }
}