<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use UniFi_API\Client;

class UniFiServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
        $this->app->singleton(Client::class, function ($app) {
            $controller_user = config('unifi.controller_user');
            $controller_password = config('unifi.controller_password');
            $controller_url = config('unifi.controller_url');
            $site_id = config('unifi.site_id');

            return new Client($controller_user, $controller_password, $controller_url, $site_id);
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
