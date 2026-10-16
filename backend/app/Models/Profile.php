<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Profile extends Model
{
    use HasFactory;

    protected $table = 'profiles'; 

    protected $fillable = [
    'user_id',
    'headline',
    'bio',
    'years_of_experience',
    'experience_level',
    'location',
    'preferred_locations',   
    'work_preference',
    'job_type_preference', 
    'expected_salary_min',
    'expected_salary_max',
    'availability',
    'github_url',
    'linkedin_url',
    'portfolio_url',
    
    ];
    protected $casts = [
    'preferred_locations' => 'array',
    'job_type_preference' => 'array',
    'open_to_work' => 'boolean',
    'expected_salary_min' => 'integer',
    'expected_salary_max' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}