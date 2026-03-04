<?php

namespace App\Http\Controllers;

use App\Events\UserJoined;
use App\Events\UserLeft;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Grpc\GPBMetadata\UserService;
use App\Grpc\CheckUserRequest;

class DrawingLobbyController extends Controller
{
    /** Cache key for the player list of a game room. */
    private function roomKey(string $gameId): string
    {
        return "room:{$gameId}:players";
    }

    public function joinLobby(Request $request, $gameId)
    {
        $user = [
            'id'   => $request->input('user_id'),
            'name' => $request->input('user_name'),
        ];

        $client = new UserService('nestjs-app:50051', [
            'credentials' => Grpc\ChannelCredentials::createInsecure(),
        ]);
        $client->CheckUser(new CheckUserRequest(['session_id' => $request->input('session_id')]));

        $response = $client->CheckById(new CheckUserRequest(['id' => $request->input('user_id')]));
        if($response->check == 0){
            return response()->json(['error' => 'User not found'], 404);
        }
        \Log::info('joinLobby called', ['gameId' => $gameId, 'user' => $user]);

        // Add the joining player to the cached player list (ttl: 2 hours)
        $key     = $this->roomKey($gameId);
        $players = Cache::get($key, []);

        // Avoid duplicates (e.g. page refresh)
        $players = array_values(array_filter($players, fn($p) => $p['id'] !== $user['id']));
        $players[] = $user;
        Cache::put($key, $players, now()->addHours(2));

        // Broadcast to existing players that someone new joined
        broadcast(new UserJoined($gameId, $user));

        // Return the FULL player list so the new joiner can populate their UI
        return response()->json([
            'message' => "Joined lobby: {$gameId}",
            'players' => $players,
        ]);
    }

    public function leaveLobby(Request $request, $gameId)
    {
        $user = [
            'id'   => $request->input('user_id'),
            'name' => $request->input('user_name'),
        ];

        \Log::info('leaveLobby called', ['gameId' => $gameId, 'user' => $user]);

        // Remove the leaving player from the cached list
        $key     = $this->roomKey($gameId);
        $players = Cache::get($key, []);
        $players = array_values(array_filter($players, fn($p) => $p['id'] !== $user['id']));
        Cache::put($key, $players, now()->addHours(2));

        broadcast(new UserLeft($gameId, $user));

        return response()->json([
            'message' => "Left lobby: {$gameId}",
            'players' => $players,
        ]);
    }
}
