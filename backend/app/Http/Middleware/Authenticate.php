<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        return $request->expectsJson() ? null : route('login');
    }

    /**
     * The handle function is responsible for authenticating user requests.
     * The method expects a $request object and a $next closure to be passed to it, as well as an optional $guards parameter.
     * The $guards parameter is used to specify the authentication guards that should be used to authenticate the request.
     */
    public function handle($request, Closure $next, ...$guards) {

        if ($token = $request->cookie('token')) {
            $request->headers->set('Authorization', 'Bearer ' . $token);
        }

        $this->authenticate($request, $guards);

        return $next($request);
    }
}
