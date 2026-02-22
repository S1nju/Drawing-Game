# Real-Time Drawing Game - Setup & Run Guide

A modern, real-time multiplayer drawing game built with Laravel Reverb WebSockets and React.

## Architecture

- **Backend**: Laravel with Reverb (WebSocket server)
- **Frontend**: React with Vite
- **Real-time Communication**: Laravel Echo + Reverb
- **Database**: Drawing coordinates storage

## Backend Setup

### 1. Install Laravel Dependencies
```bash
cd DrawingService
composer install
```

### 2. Environment Configuration
Update your `.env` file:
```env
BROADCAST_DRIVER=reverb

REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
REVERB_APP_ID=12345
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
```

### 3. Database Setup
```bash
php artisan migrate
```

### 4. Run Laravel Reverb Server
```bash
php artisan reverb:start --host=0.0.0.0 --port=8080
```

Or with Laravel's web server:
```bash
php artisan serve
```

**Note**: Reverb WebSocket server must be running separately on port 8080.

## Frontend Setup

### 1. Install Dependencies
```bash
cd FrontEnd/my-react-app
npm install
```

### 2. Configure WebSocket Connection
Update `src/services/websocket.js` with your Reverb configuration:
```javascript
export const initializeEcho = (websocketUrl = 'http://localhost:8080') => {
  // ... configuration
}
```

### 3. Run Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Running the Complete Application

### Using Docker Compose (Recommended)
```bash
docker-compose up
```

This will start:
- Laravel API (port 8000)
- Reverb WebSocket Server (port 8080)
- React Development Server (port 5173)

### Manual Setup (3 Terminal Windows)

**Terminal 1 - Reverb Server:**
```bash
cd DrawingService
php artisan reverb:start --host=0.0.0.0 --port=8080
```

**Terminal 2 - Laravel Web Server:**
```bash
cd DrawingService
php artisan serve
```

**Terminal 3 - React Development:**
```bash
cd FrontEnd/my-react-app
npm run dev
```

## Game Features

### 1. Lobby System
- Create new games with unique IDs
- Join existing games
- Enter player name

### 2. Interactive Drawing Board
- **Real-time synchronization** - All strokes appear instantly for other players
- **Color picker** - Choose any color for drawing
- **Brush size adjustment** - Control brush thickness (1-50px)
- **Clear canvas** - Reset the drawing board
- **Download drawing** - Save your artwork as PNG

### 3. Game Interface (Gartic Phone Style)
- **Game header** - Shows game ID, player count, timer
- **Players panel** - Displays connected players
- **Game stats** - Score and round information
- **Drawing canvas** - 800x600px white canvas
- **Time limit** - 2-minute countdown (configurable)

## API Endpoints

### Send Drawing Coordinates
```http
POST /api/v1/drawing
Content-Type: application/json

{
  "x": 100,
  "y": 150,
  "gameId": "game_1708615200000_abc123xyz",
  "color": "#FF0000",
  "size": 3
}
```

### Get Game Drawings
```http
GET /api/v1/drawing/{gameId}
```

### Clear Canvas
```http
DELETE /api/v1/drawing/{gameId}
```

## WebSocket Events

### Broadcasting Events
The app broadcasts drawing updates through Laravel Reverb:

```
Private Channel: drawing.{gameId}
Event: drawing.update
Data: {x, y, color, size}
```

### Subscribing to Events
Frontend listens to drawing updates:
```javascript
subscribeToGameDrawing(gameId, (data) => {
  // data contains {x, y, color, size}
  drawingBoard.drawRemoteStroke(data);
});
```

## Database Schema

### drawing_coordinates Table
```sql
CREATE TABLE drawing_coordinates (
  id BIGINT PRIMARY KEY,
  game_id VARCHAR(255),
  x FLOAT,
  y FLOAT,
  color VARCHAR(7) DEFAULT '#000000',
  size FLOAT DEFAULT 2,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  INDEX(game_id)
);
```

## Troubleshooting

### WebSocket Connection Issues

1. **Port 8080 not accessible**
   - Check if Reverb server is running: `php artisan reverb:start`
   - Verify firewall allows port 8080

2. **CORS Errors**
   - Ensure Laravel API and React dev server are accessible
   - Check CORS configuration in Laravel

3. **Drawing not syncing**
   - Verify WebSocket connection in browser DevTools (Network tab)
   - Check that both players are in the same game ID
   - Confirm Reverb is showing "broadcasting messages"

### Performance Tips

- Use smaller brush sizes for smoother performance
- Increase time limit if needed (modify GameRoom.jsx line 26)
- Consider implementing stroke batching for very fast drawing

## Future Enhancements

- [ ] Guessing mechanic (Gartic Phone style)
- [ ] Turn-based drawing rounds
- [ ] Chat system with user messages
- [ ] Leaderboard/scoring system
- [ ] Undo/Redo functionality
- [ ] Custom game settings
- [ ] Sound effects
- [ ] Mobile responsive improvements
- [ ] AI art generation feedback

## Technology Stack

- **Backend**: PHP 8.1+, Laravel 11, Reverb
- **Frontend**: React 19, Vite, Axios
- **Real-time**: Laravel Echo, Socket.io
- **Database**: Laravel's default (MySQL/SQLite/PostgreSQL)
- **Styling**: Custom CSS with responsive design

## License

MIT
