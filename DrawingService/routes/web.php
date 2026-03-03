<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DrawingController;
use App\Http\Controllers\DrawingLobbyController;

Route::get('/', function () {
    return view('welcome');
});

// Game room endpoints
Route::post('api/game/{gameId}/join',[DrawingLobbyController::class, 'joinLobby']);
Route::post('api/game/{gameId}/leave', [DrawingLobbyController::class, 'leaveLobby']);
