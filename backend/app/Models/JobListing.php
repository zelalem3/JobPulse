<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobListing extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     * * Laravel looks for "job_listings" by default, but explicitly 
     * defining it prevents any pluralization quirks down the road.
     */
    protected $table = 'job_listings';

    /**
     * The attributes that are mass assignable.
     */
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

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'skills' => 'array',       // Converts JSON column automatically to a PHP array
            'deadline' => 'date',      // Casts to a Carbon instance
            'posted_at' => 'datetime', // Casts to a Carbon instance
            'is_active' => 'boolean',  // Ensures 0/1 becomes true/false
        ];
    }
}