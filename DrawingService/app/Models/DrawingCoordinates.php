<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DrawingCoordinates extends Model
{
    protected $fillable = [
        'x',
        'y',
        'game_id',
        'color',
        'size',
    ];
}
