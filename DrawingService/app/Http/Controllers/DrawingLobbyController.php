<?php

namespace App\Http\Controllers;

use App\Events\UserJoined;
use App\Events\UserLeft;
use App\Grpc\CheckByIdRequest;
use App\Grpc\UsersServiceClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use \Grpc\ChannelCredentials;
use Game\CheckGameRequest;
use Game\GameServiceClient;
use Game\GetGameRequest;

class DrawingLobbyController extends Controller
{
    /** Cache key for the player list of a game room. */
    private function roomKey(string $gameId): string
    {
        return "room:{$gameId}:players";
    }

    private function gameClient(): GameServiceClient
    {
        return new GameServiceClient('localhost:50052', [
            'credentials' => ChannelCredentials::createInsecure(),
        ]);
    }

    private function getGameInfo(string $gameId): array
    {
        $gameclient = $this->gameClient();

        $checkGameRequest = new CheckGameRequest();
        $checkGameRequest->setGameId($gameId);
        list($checkResponse, $checkStatus) = $gameclient->CheckGame($checkGameRequest)->wait();
        if ($checkStatus->code !== \Grpc\STATUS_OK) {
            return ['error' => response()->json(['error' => 'Failed to fetch game info', 'err' => $checkStatus], 500)];
        }
        if (!$checkResponse->getExists()) {
            return ['error' => response()->json(['error' => 'Game not found'], 404)];
        }

        $gameInfoRequest = new GetGameRequest();
        $gameInfoRequest->setGameId($gameId);
        list($gameInfo, $infoStatus) = $gameclient->GetGameInfo($gameInfoRequest)->wait();
        if ($infoStatus->code !== \Grpc\STATUS_OK) {
            return ['error' => response()->json(['error' => 'Failed to fetch game parameters', 'err' => $infoStatus], 500)];
        }

        return [
            'gameId' => $gameInfo->getGameId(),
            'status' => $gameInfo->getStatus(),
            'maxPlayers' => $gameInfo->getMaxPlayers(),
            'totalRounds' => $gameInfo->getTotalRounds(),
            'turnTime' => $gameInfo->getTurnTime(),
        ];
    }

    public function lobbyInfo(string $gameId)
    {
        $gameInfo = $this->getGameInfo($gameId);
        if (isset($gameInfo['error'])) {
            return $gameInfo['error'];
        }

        $players = Cache::get($this->roomKey($gameId), []);
        $playersCount = count($players);
        $maxPlayers = max(1, (int)$gameInfo['maxPlayers']);

        return response()->json([
            'gameId' => $gameInfo['gameId'],
            'status' => $gameInfo['status'],
            'maxPlayers' => $maxPlayers,
            'totalRounds' => (int)$gameInfo['totalRounds'],
            'turnTime' => (int)$gameInfo['turnTime'],
            'playersCount' => $playersCount,
            'isFull' => $playersCount >= $maxPlayers,
            'players' => $players,
        ]);
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

        $gameInfo = $this->getGameInfo((string)$gameId);
        if (isset($gameInfo['error'])) {
            return $gameInfo['error'];
        }

        \Log::info('joinLobby called', ['gameId' => $gameId, 'user' => $user]);

        $key = $this->roomKey($gameId);
        $players = Cache::get($key, []);

        $existingIndex = null;
        foreach ($players as $index => $player) {
            if ((string)($player['id'] ?? '') === (string)$user['id']) {
                $existingIndex = $index;
                break;
            }
        }

        $maxPlayers = max(1, (int)$gameInfo['maxPlayers']);
        if ($existingIndex === null && count($players) >= $maxPlayers) {
            return response()->json([
                'error' => 'Lobby is full',
                'maxPlayers' => $maxPlayers,
                'playersCount' => count($players),
            ], 409);
        }

        // Avoid duplicates (e.g. page refresh)
        if ($existingIndex !== null) {
            $players[$existingIndex] = $user;
        } else {
            $players[] = $user;
        }

        Cache::put($key, $players, now()->addHours(2));

        // Broadcast to existing players that someone new joined
        if ($existingIndex === null) {
            broadcast(new UserJoined($gameId, $user));
        }

        // Return the FULL player list so the new joiner can populate their UI
        return response()->json([
            'message' => "Joined lobby: {$gameId}",
            'players' => $players,
            'maxPlayers' => $maxPlayers,
            'totalRounds' => (int)$gameInfo['totalRounds'],
            'turnTime' => (int)$gameInfo['turnTime'],
            'status' => $gameInfo['status'],
        ]);
    }

    public function leaveLobby(Request $request, $gameId)
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

        $gameInfo = $this->getGameInfo((string)$gameId);
        if (isset($gameInfo['error'])) {
            return $gameInfo['error'];
        }

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
            'maxPlayers' => max(1, (int)$gameInfo['maxPlayers']),
            'totalRounds' => (int)$gameInfo['totalRounds'],
            'turnTime' => (int)$gameInfo['turnTime'],
            'status' => $gameInfo['status'],
        ]);
    }
}