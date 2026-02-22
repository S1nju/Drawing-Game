<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DrawingController;
use Illuminate\Support\Facades\Broadcast;
use App\Models\User;
use Illuminate\Support\Str;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Custom broadcaster auth to support guests
Route::post('/broadcasting/auth', function (Request $request) {
    if (!$request->user()) {
        // Create a temporary guest user for this request
        $user = new User();
        $user->id = (string) Str::uuid();
        $user->name = 'Guest ' . substr($user->id, 0, 4);
        
        $request->setUserResolver(function () use ($user) {
            return $user;
        });
    }
    return Broadcast::auth($request);
})->middleware('api');
require __DIR__.'/../routes/channels.php';