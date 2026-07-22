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
        'name', 'email', 'password', 'location', 'github_url', 'linkedin_url', 'resume'
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get jobs matching this user's profile.
     */
    public function getRecommendedJobs()
    {
        $query = JobListing::query();

       
        $userSkills = $this->skills()->get();
        
        if ($userSkills->isNotEmpty()) {
            $userSkillIds = $userSkills->pluck('id')->toArray();
            
            $query->whereHas('skills', function ($q) use ($userSkillIds) {
                $q->whereIn('skills.id', $userSkillIds);
            });
        } else {
            return collect();
        }

        return $query->get();
    }

    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'skill_user');
    }
}