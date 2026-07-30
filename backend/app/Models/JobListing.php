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
        'deadline',
        'posted_at',
        'source',
        'url',
        'responsibilities',
        'is_active',
        'quality_score',
    ];

    protected function casts(): array
    {
        return [
            'deadline' => 'date',
            'posted_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function skills()
    {
        return $this->belongsToMany(
            Skill::class,
            'job_skill'
        );
    }

    public function scopeHighQuality($query)
    {
        return $query->where('quality_score', '>=', 80);
    }

    public function scopeMediumQuality($query)
    {
        return $query->whereBetween('quality_score', [50, 79]);
    }

    public function scopeLowQuality($query)
    {
        return $query->where('quality_score', '<', 50);
    }
}