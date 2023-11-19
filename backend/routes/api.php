<?php

/* use Illuminate\Http\Request; */

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\RoomController;
use App\Http\Controllers\Api\V1\CateringController;
use App\Http\Controllers\Api\V1\MaterialController;
use App\Http\Controllers\Api\V1\UniFiApiController;
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

Route::prefix('v1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::get('/rooms', [RoomController::class, 'index']);
    Route::get('/caterings', [CateringController::class, 'index']);
    Route::get('/materials', [MaterialController::class, 'index']);

    Route::get('/test-unifi-api', [UniFiApiController::class, 'testClient']);
    Route::post('/bookings/check-overlapping', [BookingController::class, 'checkOverlapping']);
});

/*
    When a request is made to a route that uses the auth:sanctum middleware,
    Sanctum will check if the request contains a valid API token.
    If the token is valid, the request is allowed to proceed.
    If the token is invalid or missing,
    the request will be rejected with a 401 Unauthorized response.
*/
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::put('/bookings/{id}', [BookingController::class, 'update']);
    Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);

    Route::get('/rooms/{id}', [RoomController::class, 'show']);

    Route::post('/create-voucher', [UniFiApiController::class, 'createVoucher']);
    /* Route::post('/bookings/check-overlapping', [BookingController::class, 'checkOverlapping']); */

});
