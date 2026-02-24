<?php

namespace App\Http\Controllers;

use App\Jobs\SendDrawingCordinates;
use Illuminate\Http\Request;

class DrawingController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'x' => 'required|numeric',
            'y' => 'required|numeric',
            'gameId' => 'required|string',
            'color' => 'nullable|string',
            'size' => 'nullable|numeric',
        ]);


        SendDrawingCordinates::dispatch($request->all());

        return response()->json(['success' => true]);
    }

    public function getGameDrawings($gameId)
    {
        $drawings = \App\Models\DrawingCoordinates::where('game_id', $gameId)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($drawings);
    }

    public function clearGame($gameId)
    {
        \App\Models\DrawingCoordinates::where('game_id', $gameId)->delete();

        return response()->json(['success' => true, 'message' => 'Game canvas cleared']);
    }
}
