<?php

namespace App\Jobs;

use App\Events\GotDrawing;
use App\Models\DrawingCoordinates;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendDrawingCordinates implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    private array $drawingCoordinates;
    public function __construct(array $drawingCoordinates)
    {
        $this->drawingCoordinates = $drawingCoordinates;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
            GotDrawing::dispatch([
                'x' => $this->drawingCoordinates['x'],
                'y' => $this->drawingCoordinates['y'],
                'color' => $this->drawingCoordinates['color'],
                'size' => $this->drawingCoordinates['size'],
            ], $this->drawingCoordinates['game_id']);
    }
}
