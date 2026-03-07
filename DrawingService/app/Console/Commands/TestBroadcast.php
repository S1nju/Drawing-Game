<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Events\ChatMessage;

class TestBroadcast extends Command
{
    protected $signature = 'test:broadcast {gameId}';
    protected $description = 'Sends a test chat message broadcast';

    public function handle()
    {
        $gameId = $this->argument('gameId');
        $this->info("Broadcasting test message to game.$gameId...");
        
        broadcast(new ChatMessage($gameId, ['id' => 'system', 'name' => 'System'], 'Test message from Artisan', false));
        
        $this->info("Broadcast command sent.");
    }
}
