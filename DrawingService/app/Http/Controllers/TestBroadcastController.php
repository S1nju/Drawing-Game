<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\TestEvent;

class TestBroadcastController extends Controller
{
    public function sendTest(Request $request)
    {
        $gameId = $request->input('gameId', 'test-' . time());
        $message = $request->input('message', 'Test broadcast message');
        
        \Log::info('Sending test broadcast', [
            'gameId' => $gameId,
            'message' => $message
        ]);
        
        event(new TestEvent($gameId, $message));
        
        return response()->json([
            'status' => 'sent',
            'gameId' => $gameId,
            'message' => $message,
            'timestamp' => now(),
            'instructions' => [
                'Open browser console',
                'Listen for "TestBroadcast" event',
                'Should see: { message: "..." }'
            ]
        ]);
    }
}
