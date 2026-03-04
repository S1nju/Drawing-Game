<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// Public game lobby channel — allow everyone
Broadcast::channel('game.{gameId}', fn() => true);

// Public drawing channel — anyone can subscribe
Broadcast::channel('drawing.{roomId}', fn() => true);


// Public chat/guess channel
Broadcast::channel('chat.{gameId}', fn() => true);

