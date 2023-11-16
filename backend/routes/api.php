<?php

/* use Illuminate\Http\Request; */
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

/* unprotected routes */
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

/*
    When a request is made to a route that uses the auth:sanctum middleware,
    Sanctum will check if the request contains a valid API token.
    If the token is valid, the request is allowed to proceed.
    If the token is invalid or missing,
    the request will be rejected with a 401 Unauthorized response.
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
});
