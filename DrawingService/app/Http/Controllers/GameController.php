<?php

namespace App\Http\Controllers;

use App\Events\GameStarted;
use App\Events\ChatMessage;
use App\Events\DrawEvent;
use App\Events\TimerReduced;
use App\Events\GameFinished;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class GameController extends Controller
{
    /** Word list players must guess from. */
    private array $words = [
        'apple', 'banana', 'bicycle', 'bridge', 'butterfly',
        'camera', 'castle', 'ceiling', 'cloud', 'coffee',
        'compass', 'crown', 'diamond', 'dolphin', 'dragon',
        'elephant', 'feather', 'fire', 'flower', 'forest',
        'guitar', 'hammer', 'helicopter', 'island', 'jellyfish',
        'key', 'ladder', 'lantern', 'lighthouse', 'lion',
        'map', 'mountain', 'mushroom', 'ocean', 'penguin',
        'piano', 'pizza', 'rainbow', 'rocket', 'snowflake',
        'spider', 'star', 'submarine', 'sun', 'sword',
        'telescope', 'tiger', 'tornado', 'treasure', 'umbrella',
        'volcano', 'waterfall', 'whale', 'witch', 'wizard',
    ];

    private function roomKey(string $gameId, string $suffix): string
    {
        return "room:{$gameId}:{$suffix}";
    }

    /**
     * Host starts the game.
     * Picks a random word, stores it in cache, broadcasts GameStarted to all players.
     */
    public function startGame(Request $request, string $gameId)
    {
        $drawerId   = (string)$request->input('user_id');
        $word       = $this->words[array_rand($this->words)];

        Cache::put($this->roomKey($gameId, 'word'),   $word,     now()->addHours(2));
        Cache::put($this->roomKey($gameId, 'drawer'), $drawerId, now()->addHours(2));
        
        // Track who has played
        Cache::put($this->roomKey($gameId, 'played_players'), [$drawerId], now()->addHours(2));
        // Track first corrector (to reduce timer only once)
        Cache::put($this->roomKey($gameId, 'first_correct'), false, now()->addHours(2));

        \Log::info('Game started', ['gameId' => $gameId, 'word' => $word, 'drawer' => $drawerId]);

        broadcast(new GameStarted($gameId, $word, $drawerId));

        return response()->json([
            'message'   => 'Game started',
            'word'      => $word,
            'drawer_id' => $drawerId,
        ]);
    }

    /**
     * A player sends a chat message / guess.
     * Checks if the guess matches the secret word.
     */
    public function sendChat(Request $request, string $gameId)
    {
        $user    = ['id' => (string)$request->input('user_id'), 'name' => (string)$request->input('user_name')];
        $message = trim($request->input('message', ''));

        if ($message === '') {
            return response()->json(['error' => 'Empty message'], 422);
        }

        $secretWord = (string)Cache::get($this->roomKey($gameId, 'word'), '');
        $drawerId   = (string)Cache::get($this->roomKey($gameId, 'drawer'), '');

        // Drawers cannot guess
        if ($user['id'] === $drawerId) {
            return response()->json(['error' => 'Drawer cannot guess'], 403);
        }

        $correct = $secretWord !== '' &&
                   strtolower(trim($message)) === strtolower($secretWord);

        broadcast(new ChatMessage($gameId, $user, $message, $correct));

        // If correct and first time this round, reduce timer
        if ($correct) {
            $alreadyCorrect = Cache::get($this->roomKey($gameId, 'first_correct'), false);
            if (!$alreadyCorrect) {
                Cache::put($this->roomKey($gameId, 'first_correct'), true, now()->addMinutes(5));
                broadcast(new TimerReduced($gameId, 5));
            }
        }

        return response()->json(['correct' => $correct]);
    }

    /**
     * Broadcast drawing data to others in the room.
     * Since this is a public channel, we use an event instead of whispers.
     */
    public function draw(Request $request, string $gameId)
    {
        $drawerId = (string)Cache::get($this->roomKey($gameId, 'drawer'), '');
        $userId   = (string)$request->input('user_id');

        // Only the designated drawer can broadcast drawing data
        if ($userId !== $drawerId) {
            return response()->json(['error' => 'Not the drawer'], 403);
        }

        broadcast(new DrawEvent($gameId, $request->all()))->toOthers();

        return response()->json(['success' => true]);
    }


    /**
     * Move to the next round / next player.
     */
    public function nextRound(Request $request, string $gameId)
    {
        // Get all connected players from lobby cache
        $lobbyKey = "room:{$gameId}:players";
        $connectedPlayers = Cache::get($lobbyKey, []);
        
        $playedPlayers = Cache::get($this->roomKey($gameId, 'played_players'), []);
        
        // Find next player who hasn't played
        $nextPlayer = null;
        foreach ($connectedPlayers as $player) {
            if (!in_array((string)$player['id'], array_map('strval', $playedPlayers))) {
                $nextPlayer = $player;
                break;
            }
        }


        if (!$nextPlayer) {
            broadcast(new GameFinished($gameId));
            return response()->json(['status' => 'finished']);
        }

        // Setup next round
        $drawerId   = $nextPlayer['id'];
        $word       = $this->words[array_rand($this->words)];
        
        $playedPlayers[] = $drawerId;
        Cache::put($this->roomKey($gameId, 'played_players'), $playedPlayers, now()->addHours(2));
        Cache::put($this->roomKey($gameId, 'word'),   $word,     now()->addHours(2));
        Cache::put($this->roomKey($gameId, 'drawer'), $drawerId, now()->addHours(2));
        Cache::put($this->roomKey($gameId, 'first_correct'), false, now()->addHours(2));

        broadcast(new GameStarted($gameId, $word, $drawerId));

        return response()->json([
            'status'    => 'started',
            'word'      => $word,
            'drawer_id' => $drawerId,
        ]);
    }
}
