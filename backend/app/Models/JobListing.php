<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobListing extends Model
{
    use HasFactory;

    protected $table = 'job_listings';

    protected $fillable = [
        'company_id',
        'title',
        'location',
        'requirements',
        'description',
        'employment_type',
        'experience_level',
        'salary',
        'category',
        'skills',
        'deadline',
        'posted_at',
        'source',
        'url',
        'responsibilities',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'skills' => 'array',
            'deadline' => 'date',
            'posted_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function skills()
    {
        return $this->belongsToMany(
            Skill::class,
            'job_skill'
        );
    }
}