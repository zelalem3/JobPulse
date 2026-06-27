<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class JobAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'keyword',
        'location',
        'category',
        'email_enabled',
        'telegram_enabled',
        'last_checked_at',
    ];

    protected $casts = [
        'email_enabled' => 'boolean',
        'telegram_enabled' => 'boolean',
        'last_checked_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
}