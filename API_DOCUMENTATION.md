# API Documentation - Drawing Game

## Base URLs
- **API**: `http://localhost:8000/api/v1`
- **WebSocket**: `http://localhost:8080`

## Endpoints

### Drawing Operations

#### 1. Send Drawing Data
**POST** `/api/v1/drawing`

Send drawing coordinates when a player draws.

**Request Body:**
```json
{
  "x": 125.5,
  "y": 200.3,
  "gameId": "game_1708607200000_abc123def",
  "color": "#FF0000",
  "size": 5
}
```

**Parameters:**
- `x` (float, required): X coordinate on canvas
- `y` (float, required): Y coordinate on canvas
- `gameId` (string, required): Unique game room identifier
- `color` (string, optional): Hex color code (default: #000000)
- `size` (float, optional): Brush size in pixels (default: 2)

**Response (Success):**
```json
{
  "success": true
}
```

**Response (Validation Error):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "x": ["The x field is required."],
    "y": ["The y field is required."],
    "gameId": ["The game id field is required."]
  }
}
```

**Status Codes:**
- `200` - Drawing data received
- `422` - Validation error

---

#### 2. Get Game Drawings
**GET** `/api/v1/drawing/{gameId}`

Retrieve all drawing coordinates for a specific game room.

**URL Parameters:**
- `gameId` (string, required): Game room identifier

**Response (Success):**
```json
[
  {
    "id": 1,
    "game_id": "game_1708607200000_abc123def",
    "x": 125.5,
    "y": 200.3,
    "color": "#FF0000",
    "size": 5,
    "created_at": "2025-02-22T10:30:45.000Z",
    "updated_at": "2025-02-22T10:30:45.000Z"
  },
  {
    "id": 2,
    "game_id": "game_1708607200000_abc123def",
    "x": 130.2,
    "y": 205.1,
    "color": "#FF0000",
    "size": 5,
    "created_at": "2025-02-22T10:30:46.000Z",
    "updated_at": "2025-02-22T10:30:46.000Z"
  }
]
```

**Status Codes:**
- `200` - Success (returns array, possibly empty)

---

#### 3. Clear Game Canvas
**DELETE** `/api/v1/drawing/{gameId}`

Delete all drawing coordinates for a game room.

**URL Parameters:**
- `gameId` (string, required): Game room identifier

**Response (Success):**
```json
{
  "success": true,
  "message": "Game canvas cleared"
}
```

**Status Codes:**
- `200` - Canvas cleared successfully

---

## WebSocket Events

### Broadcasting Events (Server → Client)

The application uses Laravel Echo with Socket.IO to broadcast drawing updates.

#### Event: `drawing.update`
**Channel**: `private-drawing.{gameId}`

Fired when a player sends drawing data.

**Event Data:**
```json
{
  "data": {
    "x": 125.5,
    "y": 200.3,
    "color": "#FF0000",
    "size": 5
  }
}
```

**Listener (React):**
```javascript
import { subscribeToGameDrawing } from '../services/websocket';

subscribeToGameDrawing(gameId, (data) => {
  console.log('Received drawing:', data);
  // Update canvas with drawing data
  drawingBoardRef.current.drawRemoteStroke(data);
});
```

---

## Request/Response Examples

### Example 1: Complete Drawing Session

**1. Create Game**
```
Frontend generates: game_1708607200000_abc123def
```

**2. Player A Draws Line**
```bash
curl -X POST http://localhost:8000/api/v1/drawing \
  -H "Content-Type: application/json" \
  -d '{
    "x": 100,
    "y": 150,
    "gameId": "game_1708607200000_abc123def",
    "color": "#FF0000",
    "size": 3
  }'
```

**3. Event Broadcasts to All Clients**
```
Channel: private-drawing.game_1708607200000_abc123def
Event: drawing.update
Data: {x: 100, y: 150, color: "#FF0000", size: 3}
```

**4. Player B Joins and Gets History**
```bash
curl http://localhost:8000/api/v1/drawing/game_1708607200000_abc123def
```

Returns array of all drawing coordinates.

**5. Clear Canvas**
```bash
curl -X DELETE http://localhost:8000/api/v1/drawing/game_1708607200000_abc123def
```

---

## Error Handling

All endpoints follow consistent error response format:

**Validation Error (422):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "fieldName": ["Error message"]
  }
}
```

**Not Found (404):**
```json
{
  "message": "Not Found"
}
```

**Server Error (500):**
```json
{
  "message": "Server error occurred",
  "error": "Error details"
}
```

---

## Rate Limiting & Performance

- No built-in rate limiting (consider adding for production)
- Database stores all drawing coordinates indefinitely
- Auto-cleanup recommended for old games (add scheduled job)

**Cleanup Old Games (Add to app/Console/Kernel.php):**
```php
$schedule->call(function () {
    DrawingCoordinates::where('created_at', '<', now()->subDays(7))->delete();
})->daily();
```

---

## WebSocket Connection Details

### Socket.IO Configuration
```javascript
{
  broadcaster: 'socket.io',
  client: socket,
  host: 'http://localhost:8080',
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  transports: ['websocket', 'polling']
}
```

### Channel Types
- **Public**: `drawing.{gameId}` (accessible to anyone with gameId)
- **Private**: `private-drawing.{gameId}` (requires authentication)

Current implementation uses private channels for security.

---

## Testing Checklist

- [ ] Create game successfully
- [ ] Send drawing data (validate all fields)
- [ ] Retrieve game drawings
- [ ] Clear canvas
- [ ] Real-time broadcast works
- [ ] WebSocket reconnects on disconnect
- [ ] Multiple clients see same drawing
- [ ] Error handling for invalid data
- [ ] Performance with 100+ drawing points

---

## Integration Notes

### For Third-Party Applications

To integrate with this drawing API:

1. **Initialize WebSocket:**
   ```javascript
   import { initializeEcho } from './services/websocket';
   initializeEcho('localhost:8080');
   ```

2. **Send Drawing:**
   ```javascript
   const response = await fetch('/api/v1/drawing', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({x, y, gameId, color, size})
   });
   ```

3. **Subscribe to Updates:**
   ```javascript
   import { subscribeToGameDrawing } from './services/websocket';
   subscribeToGameDrawing(gameId, (data) => {});
   ```

---

**Last Updated**: February 22, 2025
**API Version**: 1.0
