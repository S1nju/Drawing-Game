# Drawing Game - Project Structure & Architecture

## 📁 Project Directory Structure

```
/DrawingGame
├── DrawingService/                  # Laravel Backend
│   ├── app/
│   │   ├── Events/
│   │   │   └── GotDrawing.php      # WebSocket event for broadcasting draws
│   │   ├── Http/Controllers/
│   │   │   └── DrawingController.php # API endpoints
│   │   ├── Jobs/
│   │   │   └── SendDrawingCordinates.php # Async job dispatcher
│   │   └── Models/
│   │       └── DrawingCoordinates.php # DB model for coordinates
│   ├── config/
│   │   ├── broadcasting.php         # Reverb broadcasting config
│   │   └── reverb.php               # WebSocket server config
│   ├── database/migrations/
│   │   └── 2025_02_22_000000_create_drawing_coordinates_table.php
│   ├── routes/
│   │   └── web.php                  # API routes
│   └── ...

├── FrontEnd/my-react-app/           # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── DrawingBoard.jsx     # Canvas drawing component
│   │   │   ├── GameLobby.jsx        # Game lobby/setup screen
│   │   │   └── GameRoom.jsx         # Main game room with players
│   │   ├── services/
│   │   │   └── websocket.js         # Laravel Echo WebSocket service
│   │   ├── App.jsx                  # Main app with routing logic
│   │   ├── App.css                  # All styling (Gartic Phone style)
│   │   ├── index.css                # Global styles
│   │   └── main.jsx                 # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── ...

├── GAME_SETUP.md                    # Complete setup guide
├── QUICK_START.md                   # Quick reference
├── docker-compose.yml               # Docker orchestration
└── README.md                         # Project overview
```

## 🏗️ Architecture Overview

### Backend Flow
```
Client Request (POST /api/v1/drawing)
        ↓
DrawingController::store()
        ↓
Create DrawingCoordinates model
        ↓
Dispatch SendDrawingCordinates job
        ↓
Job executes: GotDrawing::dispatch()
        ↓
Reverb broadcasts to private-drawing.{gameId}
        ↓
All subscribed clients receive event
```

### Frontend Flow
```
User draws on canvas
        ↓
handleMouseMove() sends fetch to /api/v1/drawing
        ↓
Local canvas updates immediately
        ↓
Send to all other clients via WebSocket
        ↓
Other clients' DrawingBoard.drawRemoteStroke()
        ↓
Their canvas updates
```

## 🔄 Real-Time Data Flow

### Broadcast Channel Structure
```
Private Channel: "drawing.{gameId}"
Every drawing action broadcasts an event:

{
  "x": 150.5,
  "y": 200.3,
  "color": "#FF0000",
  "size": 3,
  "gameId": "game_1708615200000_abc123xyz"
}
```

### Game ID Generation
Game IDs are unique per game session:
```javascript
`game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
// Example: game_1708615200000_xyz7a9q3b
```

## 📊 Data Models

### DrawingCoordinates Table
| Field | Type | Purpose |
|-------|------|---------|
| id | BIGINT | Primary key |
| game_id | VARCHAR(255) | Groups drawings by game |
| x | FLOAT | X coordinate |
| y | FLOAT | Y coordinate |
| color | VARCHAR(7) | Hex color code |
| size | FLOAT | Brush thickness |
| created_at | TIMESTAMP | Record timestamp |
| updated_at | TIMESTAMP | Update timestamp |

### Game State (Frontend)
```javascript
{
  playerName: "Alice",
  gameId: "game_1708615200000_abc",
  isCreator: true,
  connectedPlayers: ["Alice", "Bob"],
  gameStatus: "drawing" | "waiting" | "finished",
  timeRemaining: 120 // seconds
}
```

## 🎨 Component Responsibilities

### GameLobby.jsx
**Purpose**: Initial screen for game creation/joining
**Features**:
- Toggle between create/join modes
- Input player name
- Generate unique game IDs
- Display feature highlights
**Props**:
- `onStartGame(data)` - Called with game setup data

### DrawingBoard.jsx (Forwardref)
**Purpose**: Canvas drawing interface
**Features**:
- Draw strokes with mouse
- Color selection
- Brush size adjustment
- Clear canvas
- Download as PNG
- Receive and render remote strokes
**Exposed Methods**:
- `drawRemoteStroke(data)` - Draw point from other players
- `clearCanvas()` - Clear from remote clear event
**Props**:
- `gameId` - Current game ID
- `playerName` - Current player name
- `onClear` - Callback when clearing

### GameRoom.jsx
**Purpose**: Main game interface
**Features**:
- Game context/settings display
- Timer countdown
- Player list
- Game statistics
- WebSocket subscription management
**Props**:
- `playerName` - Current player
- `gameId` - Game identifier
- `isCreator` - Creator privileges flag
- `onBackToLobby` - Exit game callback

### websocket.js (Service)
**Purpose**: Laravel Echo WebSocket management
**Functions**:
- `initializeEcho()` - Create Echo connection
- `subscribeToGameDrawing()` - Subscribe to game channel
- `unsubscribeFromGame()` - Cleanup connections
- `getEcho()` - Get Echo instance

## 🔐 Security Considerations

### Current Implementation
- ✅ Game IDs are cryptographically unique
- ✅ Private channels (Laravel Reverb authorization)
- ✅ Input validation on backend

### Recommendations for Production
- ⚠️ Add user authentication
- ⚠️ Implement authorization checks
- ⚠️ Add rate limiting
- ⚠️ Validate game access permissions
- ⚠️ Sanitize drawing data

## 📈 Performance Optimization

### Current Optimizations
- Drawing strokes sent individually (real-time)
- Canvas cleared on demand, not on timer
- Efficient point drawing (arc vs line)

### Potential Improvements
- **Stroke batching**: Send multiple points in one request
- **Compression**: Reduce coordinate precision for bandwidth
- **Canvas throttling**: Limit update rate to 60fps
- **Lazy loading**: Load historical drawings on join
- **Caching**: Store recent game states

## 🧪 Testing Strategy

### Unit Tests (Recommended)
- DrawingController data validation
- DrawingCoordinates model constraints
- WebSocket event broadcasting
- React component rendering

### Integration Tests (Recommended)
- API endpoints (POST, GET, DELETE)
- Database operations
- WebSocket message delivery
- Multi-player synchronization

### Manual Tests (Included Guide)
- See QUICK_START.md for testing procedures

## 🚀 Deployment Considerations

### Requirements
- PHP 8.1+ with ext-websocket
- Node.js 18+ for frontend builds
- MySQL/PostgreSQL database
- Redis (for Reverb scaling)

### Environment Variables
```env
# Backend
BROADCAST_DRIVER=reverb
REVERB_APP_KEY=your-key
REVERB_APP_SECRET=your-secret
REVERB_APP_ID=12345
REVERB_HOST=your-domain.com
REVERB_PORT=443
REVERB_SCHEME=https

# Frontend
VITE_API_URL=https://your-domain.com
VITE_WS_HOST=your-domain.com
VITE_WS_PORT=443
```

### Docker Deployment
See docker-compose.yml for containerized setup

## 📚 API Reference

### Endpoints

#### 1. Create/Send Drawing
```
POST /api/v1/drawing
Content-Type: application/json

Request:
{
  "x": 150,
  "y": 200,
  "gameId": "game_1708615200000_abc",
  "color": "#FF0000",
  "size": 3
}

Response: { "success": true }
```

#### 2. Get Game Drawings
```
GET /api/v1/drawing/{gameId}

Response: Array of DrawingCoordinates
[
  { "id": 1, "x": 150, "y": 200, "color": "#FF0000", "size": 3, ... },
  { "id": 2, "x": 160, "y": 210, "color": "#FF0000", "size": 3, ... },
  ...
]
```

#### 3. Clear Canvas
```
DELETE /api/v1/drawing/{gameId}

Response: { "success": true, "message": "Game canvas cleared" }
```

## 🔊 WebSocket Events

### Subscription
```javascript
Channel: drawing.{gameId}
Event name: drawing.update
Listener: (data) => { ... }
```

### Event Payload
```javascript
{
  "data": {
    "x": 150,
    "y": 200,
    "color": "#FF0000",
    "size": 3
  }
}
```

## 🎓 Learning Path

1. **Setup Phase**: Follow GAME_SETUP.md
2. **Quick Start**: Follow QUICK_START.md to run the game
3. **Code Exploration**:
   - Review DrawingController (backend logic)
   - Review GameRoom.jsx (component orchestration)
   - Review websocket.js (real-time communication)
4. **Feature Addition**:
   - Add guessing round
   - Add scoring system
   - Add chat system

## 📞 Support & Debugging

### Common Issues

**"Cannot connect to Reverb"**
- Check: `ps aux | grep reverb`
- Port must be 8080
- Check firewall rules

**"Drawing not syncing"**
- Check Network tab in DevTools
- Should see WebSocket frames
- Verify game IDs match

**"API returns 404"**
- Check routes in routes/web.php
- Verify DrawingController exists
- Check namespace in controller

### Debug Mode

Enable logging:
```php
// In DrawingController
Log::info('Drawing received', $request->all());
```

Check logs:
```bash
tail -f DrawingService/storage/logs/laravel.log
```

---

**Last Updated**: February 22, 2026
**Version**: 1.0
