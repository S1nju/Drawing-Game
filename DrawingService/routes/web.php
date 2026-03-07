<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DrawingController;
use App\Http\Controllers\DrawingLobbyController;

Route::get('/', function () {
    return view('welcome');
});

// Game room endpoints (moved to api.php to be CSRF-exempt)
