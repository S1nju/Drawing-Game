<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DrawingController;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Events\UserJoined;
use App\Events\UserLeft;
use App\Http\Controllers\DrawingLobbyController;
use Illuminate\Support\Str;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


// Test broadcast endpoint
Route::post('/test/broadcast', [\App\Http\Controllers\TestBroadcastController::class, 'sendTest']);

