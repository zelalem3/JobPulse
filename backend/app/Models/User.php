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
        'telegram_chat_id',
        'telegram_username',
        'telegram_connected_at',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'telegram_connected_at' => 'datetime',
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
     * Many-to-many relationship with Skill.
     */
    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'skill_user');
    }

    /**
     * Add skill(s) without removing existing ones.
     */
    public function addSkill($skillIds)
    {
        return $this->skills()->syncWithoutDetaching($skillIds);
    }

    /**
     * Remove a specific skill.
     */
    public function removeSkill($skillId)
    {
        return $this->skills()->detach($skillId);
    }

    /**
     * Sync skills to an exact list.
     */
    public function syncSkills(array $skillIds)
    {
        return $this->skills()->sync($skillIds);
    }

    public function savedJobs()
    {
        return $this->hasMany(SavedJob::class);
    }

    public function jobAlerts()
    {
        return $this->hasMany(JobAlert::class);
    }

    public function profile()
    {
        return $this->hasOne(Profile::class);
    }
}