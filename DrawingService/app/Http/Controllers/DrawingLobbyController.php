<?php

namespace App\Http\Controllers;

use App\Events\UserJoined;
use App\Events\UserLeft;
use App\Grpc\CheckByIdRequest;
use App\Grpc\UsersServiceClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Grpc\CheckUserRequest;
use \Grpc\ChannelCredentials;
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
            'id' => $request->input('user_id'),
            'name' => $request->input('user_name'),
        ];

        $client = new UsersServiceClient('localhost:50051', [
            'credentials' => ChannelCredentials::createInsecure(),
        ]);

        $userInfoRequest = new CheckByIdRequest();
        $userInfoRequest->setId(intval($request->input('user_id')));
        list($response, $status) = $client->CheckById($userInfoRequest)->wait();
        if ($status->code !== \Grpc\STATUS_OK) {
            return response()->json(['error' => 'Failed to fetch user info','err' => $status], 500);
        }
        \Log::info('joinLobby called', ['gameId' => $gameId, 'user' => $user]);

        $key = $this->roomKey($gameId);
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
            'id' => $request->input('user_id'),
            'name' => $request->input('user_name'),
        ];

        \Log::info('leaveLobby called', ['gameId' => $gameId, 'user' => $user]);

        // Remove the leaving player from the cached list
        $key = $this->roomKey($gameId);
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