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
    'experience_level',
    'years_of_experience',
    'location',
    'work_preference',
    'expected_salary_min',
    'expected_salary_max',
    'availability',
    'open_to_work',
    'github_url',
    'linkedin_url',
    'portfolio_url',
    'resume_path',
    ];

    protected $casts = [
        'open_to_work' => 'boolean',
        'years_of_experience' => 'integer',
        'expected_salary_min' => 'integer',
        'expected_salary_max' => 'integer',
    ];
  

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}