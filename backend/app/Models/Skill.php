<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Skill extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    /**
     * Get all jobs mapped to this distinct skill cluster index.
     */
    public function jobs(): BelongsToMany
    {
        return $this->belongsToMany(Job::class)->withTimestamps();
    }
}