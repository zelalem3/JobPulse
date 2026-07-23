<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SavedJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'job_listing_id',
      
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Add this relationship method
    public function job()
    {
        return $this->belongsTo(JobListing::class, 'job_listing_id');
    }
}