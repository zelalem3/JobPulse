<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'jobs';

    /**
     * The attributes that are mass assignable.
     * Add the specific columns from your jobs migration here.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'company',
        'location',
        'description',
        'salary',
        'url',
        'source', // e.g., 'linkedin', 'indeed', or your custom scraper names
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}