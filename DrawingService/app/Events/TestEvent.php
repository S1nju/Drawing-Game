<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TestEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels 

;

    public function __construct(
        public string $gameId,
        public string $message
    ) {
        \Log::info('TestEvent created', [
            'gameId' => $this->gameId,
            'message' => $this->message
        ]);
    }

    public function broadcastOn(): array
    {
        \Log::info('TestEvent broadcasting on:', ['channel' => 'game.' . $this->gameId]);
        return [
            new Channel('game.' . $this->gameId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'TestBroadcast';
    }

    public function broadcastWith(): array
    {
        return [
            'message' => $this->message,
            'timestamp' => now()->toIso8601String()
        ];
    }
}
