<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

Broadcast::channel('drawing.{roomId}', function ($user, $roomId) {
    // This will show up in your terminal or storage/logs/laravel.log
    Log::info("Channel auth hit for room: " . $roomId);

    return [
        'id' => (string) Str::random(10),
        'name' => 'Guest'
    ];
});