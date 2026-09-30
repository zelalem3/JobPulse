<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class JobAlertDelivery extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'job_alert_id',
        'job_listing_id',
        'delivered_at',
    ];

    protected $casts = [
        'delivered_at' => 'datetime',
    ];

    public function alert()
    {
        return $this->belongsTo(JobAlert::class, 'job_alert_id');
    }

    public function job()
    {
        return $this->belongsTo(JobListing::class, 'job_listing_id');
    }
}
