# Quick Start Guide - Drawing Game

## 🚀 3-Step Startup

### Step 1: Start Reverb WebSocket Server
```bash
cd DrawingService
php artisan reverb:start --host=0.0.0.0 --port=8080
```

### Step 2: Start Laravel API
```bash
cd DrawingService
php artisan serve
```

### Step 3: Start React Frontend
```bash
cd FrontEnd/my-react-app
npm run dev
```

## 🎮 Playing the Game

1. **Open your browser**: Navigate to `http://localhost:5173`

2. **Create a Game**:
   - Enter your name (e.g., "Alice")
   - Click "Create Game"
   - You'll get a Game ID like: `game_1708615200000_abc123xyz`

3. **Join with Another Player** (in another browser/tab):
   - Enter different name (e.g., "Bob")
   - Click "Join Existing Game"
   - Paste the Game ID from step 2
   - Click "Join Game"

4. **Start Drawing**:
   - Both players can now see the same canvas
   - Use color picker to change brush color
   - Adjust brush size with the slider
   - Draw on the canvas
   - **Watch your strokes appear in real-time on the other player's screen!**

5. **Game Controls**:
   - ✏️ **Color Picker**: Click to select any color
   - 📏 **Brush Size**: Drag slider (1-50px)
   - 🗑️ **Clear Canvas**: Reset the drawing board
   - 💾 **Download**: Save drawing as PNG
   - 🚪 **Exit Game**: Return to lobby

## 🧪 Testing Real-Time Sync

### Test 1: Single Stroke
1. Player A draws a line
2. This should instantly appear on Player B's screen

### Test 2: Simultaneous Drawing
1. Both players draw at the same time
2. Strokes should overlap correctly without conflicts

### Test 3: Color Changes
1. Player A changes brush color and draws
2. Player B's canvas should show the new color
3. Change again - previous strokes keep their color, new ones use new color

### Test 4: Clear Canvas
1. Both players draw something
2. Player A clicks "Clear Canvas"
3. Both canvases should clear simultaneously

### Test 5: Multiple Games
1. Create Game 1 (Alice + Bob drawing)
2. Create Game 2 (Charlie + Diana drawing)
3. Verify Game 1 players don't see Game 2 drawings

## 📊 Monitoring

### Browser Console
- Check for WebSocket connection errors
- Verify API calls to `/api/v1/drawing` succeed with 200 status

### Server Logs
- Watch Laravel for POST requests to `/api/v1/drawing`
- Watch Reverb for broadcast messages
- Check for any database errors in storage/logs/laravel.log

## 🔧 Debugging

### Canvas not responding
- Refresh the page
- Check browser console for JS errors
- Verify Reverb server is running

### Drawings not syncing
- Check network tab (should see WebSocket connection to :8080)
- Verify both players are using the same Game ID
- Look at Reverb logs for subscription confirmations

### API 404 errors
- Ensure Laravel is running on port 8000
- Check routes in DrawingService/routes/web.php
- Verify DrawingController exists in app/Http/Controllers/

## 📝 Known Issues & Limitations

1. **No persistence** - Drawings are cleared when server restarts
2. **No authentication** - Anyone can join any game
3. **Basic drawing** - No undo/redo, eraser, or shapes
4. **No guessing** - This is pure drawing, not Gartic Phone gameplay

## ✨ Next Steps

To add features:
1. **Chat**: Add real-time messages between players
2. **Guessing**: Implement turns where one player draws and others guess
3. **Scoring**: Add points for correct guesses
4. **Rounds**: Implement multiple rounds with role rotation
5. **Themes**: Add random drawing prompts each round

## 📞 Support

If something doesn't work:
1. Check all three servers are running
2. Clear browser cache (Ctrl+Shift+Delete)
3. Restart all servers
4. Check browser console for errors
5. Check Laravel logs: `tail -f DrawingService/storage/logs/laravel.log`
