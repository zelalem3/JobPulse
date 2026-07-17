<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\RecommendationService; 
use App\Mail\JobRecommendationsMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendDailyRecommendations extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'recommendations:send';

    /**
     * The console command description.
     */
    protected $description = 'Send recommended job listings to users based on their preferences';

    /**
     * Execute the console command.
     */
  /**
     * Execute the console command.
     */
    public function handle(RecommendationService $service)
    {
        $this->info('Starting recommendation emails delivery...');

        // Query all users directly since there is no 'email_enabled' column
        User::query()
            ->chunk(100, function ($users) use ($service) {
                foreach ($users as $user) {
                    try {
                        // Get recommendations using your service
                        $recommendations = $service->getRecommendations($user);

                        // Only send an email if there are matches
                        if (!empty($recommendations) && count($recommendations) > 0) {
                            Mail::to($user->email)->send(
                                new JobRecommendationsMail($user, collect($recommendations))
                            );
                            
                            $this->info("Email sent to: {$user->email}");
                        }
                    } catch (\Throwable $e) {
                        \Log::error("Failed sending recommendations to {$user->email}: " . $e->getMessage());
                    }
                }
            });

        $this->info('All emails sent successfully!');
    }
}