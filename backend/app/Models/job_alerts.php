<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobAlert extends Model
{
    use HasFactory;

    protected $table = 'job_alerts';

    protected $fillable = [
        'user_id',
        'keyword',
        'location',
        'sources',
        'frequency',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'sources' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}