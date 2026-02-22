<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('drawing.{id}', function ($user, $id) {
    return true;
});
