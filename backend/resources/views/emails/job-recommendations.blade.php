<h2>Hey {{ $user->name }}! 👋</h2>

<p>Based on your profile, we found some jobs you might be interested in:</p>

<hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">

@foreach ($jobs as $job)
    <div style="margin-bottom: 25px;">
        <h3 style="margin: 0 0 5px 0; color: #1a73e8;">{{ $job->title }}</h3>
        <p style="margin: 0 0 10px 0; color: #5f6368;">
            <strong>Location:</strong> {{ $job->location }}
        </p>
        <a href="{{ $job->url }}" style="background-color: #1a73e8; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; display: inline-block; font-size: 14px;">
            View Job Listing
        </a>
    </div>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
@endforeach

<p>
    Thanks for using JobPulse,<br>
    The JobPulse Team
</p>