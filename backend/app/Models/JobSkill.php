<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobSkill extends Model 
{
    use HasFactory;

    protected $table = 'jobs';

    protected $fillable = [
        'title',
        'location',
        'url',
        'skills',
    ];

    protected $casts = [
        'skills' => 'array', 
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}