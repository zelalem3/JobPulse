<?php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Option A: Explicitly allow your Vercel URL
    'allowed_origins' => ['https://job-pulse-five.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],

    // Option B (If you want to allow all origins temporarily for debugging):
    // 'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];