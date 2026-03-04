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
use App\Http\Controllers\GameController;
use Illuminate\Support\Str;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Game room endpoints
Route::post('/game/{gameId}/join',  [DrawingLobbyController::class, 'joinLobby']);
Route::post('/game/{gameId}/leave', [DrawingLobbyController::class, 'leaveLobby']);

Route::post('/game/{gameId}/start',      [GameController::class, 'startGame']);
Route::post('/game/{gameId}/chat',       [GameController::class, 'sendChat']);
Route::post('/game/{gameId}/draw',       [GameController::class, 'draw']);
Route::post('/game/{gameId}/next-round', [GameController::class, 'nextRound']);




