<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DrawingController;

Route::get('/', function () {
    return view('welcome');
});

Route::post('/api/v1/drawing', [DrawingController::class, 'store']);
Route::get('/api/v1/drawing/{gameId}', [DrawingController::class, 'getGameDrawings']);
Route::delete('/api/v1/drawing/{gameId}', [DrawingController::class, 'clearGame']);
