<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatMessage implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $gameId,
        public array  $user,
        public string $message,
        public bool   $correct
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('chat.' . $this->gameId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'ChatMessage';
    }

    public function broadcastWith(): array
    {
        return [
            'user'    => $this->user,
            'message' => $this->message,
            'correct' => $this->correct,
        ];
    }
}
