<?php

namespace App\Http\Controllers;

use App\Events\UserJoined;
use App\Events\UserLeft;
use Illuminate\Http\Request;

class DrawingLobbyController extends Controller
{
    //
    public function joinLobby(Request $request, $gameId)
    {
        \Log::info('joinLobby called', [
            'gameId' => $gameId,
            'user_id' => $request->input('user_id'),
            'user_name' => $request->input('user_name')
        ]);

        broadcast(new UserJoined($gameId, [
            'id' => $request->input('user_id'), // Fallback to a random ID if not provided
            'name' => $request->input('user_name') // Fallback to 'Guest' if not provided
        ])) ;
        // Logic to join a drawing lobby
        return response()->json(['message' => "Joined lobby: $gameId","userdata" => [
            'id' => $request->input('user_id'), // Fallback to a random ID if not provided
            'name' => $request->input('user_name') // Fallback to 'Guest' if not provided
        ]]);
    }
    public function leaveLobby(Request $request, $gameId)
    {
        \Log::info('leaveLobby called', [
            'gameId' => $gameId,
            'user_id' => $request->input('user_id'),
            'user_name' => $request->input('user_name')
        ]);

        // Logic to leave a drawing lobby
        broadcast(new UserLeft($gameId, [
            'id' => $request->input('user_id'), // Fallback to a random ID if not provided
            'name' => $request->input('user_name') // Fallback to 'Guest' if not provided
        ]));
        return response()->json(['message' => "Left lobby: $gameId","userdata" => [
            'id' => $request->input('user_id'), // Fallback to a random ID if not provided
            'name' => $request->input('user_name') // Fallback to 'Guest' if not provided
        ]]);
    }
}
