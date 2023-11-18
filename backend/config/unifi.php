<?php
return [
    'controller_user' => env('UNIFI_CONTROLLER_USER'),
    'controller_password' => env('UNIFI_CONTROLLER_PASSWORD'),
    'controller_url' => env('UNIFI_CONTROLLER_URL'),
    'site_id' => env('UNIFI_SITE_ID', 'default'),  // "default" is the default site ID
    'debug' => true,
];
