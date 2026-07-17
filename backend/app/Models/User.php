<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'location', 'github_url', 'linkedin_url', 'resume', 'skills'
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'skills' => 'array', 
    ];

    /**
     * Get jobs matching this user's profile.
     */
    /**
     * Get jobs matching this user's profile.
     */
    public function getRecommendedJobs()
    {
        $query = JobListing::query();

        // 1. Filter by Location
        if (!empty($this->location)) {
            $query->where('location', 'ILIKE', '%' . $this->location . '%');
        }

        // 2. Filter by Skills matching the pivot table records
        if (is_array($this->skills) && count($this->skills) > 0) {
            $query->whereHas('skills', function ($q) {
                // Match job listings that have any skill name matching the user's skills array
                $q->whereIn('name', $this->skills);
            });
        }

        return $query->get();
    }
}