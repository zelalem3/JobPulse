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

        $totalSent = 0;

        User::query()->chunk(100, function ($users) use ($service, &$totalSent) {
            $this->info('Processing chunk of ' . $users->count() . ' users...');

            foreach ($users as $user) {
                try {
                    $recommendations = $service->getRecommendations($user);

                    // Debug what is coming back
                    $count = is_countable($recommendations) ? count($recommendations) : (is_array($recommendations) ? count($recommendations) : 0);
                    $this->line("User: {$user->email} | Found recommendations: {$count}");

                    if (!empty($recommendations) && $count > 0) {
                        Mail::to($user->email)->send(
                            new JobRecommendationsMail($user, collect($recommendations))
                        );
                        
                        $this->info("✔ Email sent to: {$user->email}");
                        $totalSent++;
                    } else {
                        $this->warn("✖ Skipped {$user->email} (No recommendations found).");
                    }
                } catch (\Throwable $e) {
                    $this->error("Failed sending to {$user->email}: " . $e->getMessage());
                    \Log::error("Failed sending recommendations to {$user->email}: " . $e->getMessage());
                }
            }
        });

        $this->info("Finished! Total emails actually sent: {$totalSent}");
    }
}