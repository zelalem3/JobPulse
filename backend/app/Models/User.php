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
    'name', 
    'email', 
    'password', 
    'role',
    'location', 
    'bio',
    'github_url', 
    'linkedin_url', 
    'resume'
];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get jobs matching this user's profile based on skills.
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

    /**
     * Define the many-to-many relationship with Skill.
     */
    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'skill_user');
    }

    /**
     * Helper: Add a single skill or multiple skills without removing existing ones.
     */
    public function addSkill($skillIdRs)
    {
        return $this->skills()->syncWithoutDetaching($skillIdRs);
    }

    /**
     * Helper: Remove a specific skill from the user.
     */
    public function removeSkill($skillId)
    {
        return $this->skills()->detach($skillId);
    }

    /**
     * Helper: Completely synchronize user skills to match an exact list.
     */
    public function syncSkills(array $skillIds)
    {
        return $this->skills()->sync($skillIds);
    }
    public function savedJobs()
    {
        return $this->hasMany(SavedJob::class);
    }
}