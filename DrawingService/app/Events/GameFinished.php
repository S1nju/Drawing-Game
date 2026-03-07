<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GameFinished implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $gameId
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('game.' . $this->gameId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'GameFinished';
    }
}
