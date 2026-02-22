# 🎨 Real-Time Drawing Game

A multiplayer drawing game built with Laravel Reverb and React. Players can create or join game rooms and draw together in real-time!

## ✨ Features

- **Real-time Synchronization**: Draw strokes appear instantly for all players
- **Game Rooms**: Create unique game IDs for multiplayer sessions
- **Drawing Tools**: 
  - Color picker for custom colors
  - Adjustable brush sizes (1-50px)
  - Clear canvas button
  - Download drawings as PNG
- **Game UI**: Gartic-Phone inspired interface
- **Player Tracking**: See connected players in sidebar
- **Game Timer**: 2-minute countdown timer per round

## 🏗️ Architecture

### Backend (Laravel)
- **WebSocket Server**: Reverb for real-time communication
- **Broadcasting**: Laravel Broadcasting with Socket.IO
- **Database**: Stores drawing coordinates and metadata
- **API Endpoints**:
  - `POST /api/v1/drawing` - Send drawing coordinates
  - `GET /api/v1/drawing/{gameId}` - Fetch game drawings
  - `DELETE /api/v1/drawing/{gameId}` - Clear canvas

### Frontend (React)
- **Components**:
  - `GameLobby.jsx` - Entry point for creating/joining games
  - `GameRoom.jsx` - Main game interface with sidebar
  - `DrawingBoard.jsx` - Canvas and drawing controls
- **Services**:
  - `websocket.js` - Echo/Socket.IO connection management
- **Styling**: Custom CSS with responsive design

## 🚀 Quick Start

### Prerequisites
- PHP 8.1+
- Node.js 18+
- Composer
- SQLite or MySQL

### Installation

1. **Clone the repository** (if using git)
   ```bash
   cd DrawingGame
   ```

2. **Backend Setup**
   ```bash
   cd DrawingService
   
   # Copy environment file
   cp .env.example .env
   
   # Install dependencies
   composer install
   
   # Generate app key
   php artisan key:generate
   
   # Run migrations
   php artisan migrate
   ```

3. **Frontend Setup**
   ```bash
   cd ../FrontEnd/my-react-app
   
   # Install dependencies (already done if you ran npm install)
   npm install
   ```

### Running the Application

Open 3 terminals and run:

**Terminal 1 - Laravel Server**
```bash
cd DrawingService
php artisan serve
```
Runs on `http://localhost:8000`

**Terminal 2 - Reverb WebSocket Server**
```bash
cd DrawingService
php artisan reverb:start
```
Runs on `http://localhost:8080`

**Terminal 3 - React Dev Server**
```bash
cd FrontEnd/my-react-app
npm run dev
```
Opens at `http://localhost:5173`

## 📖 How to Play

1. **Create or Join a Game**
   - Enter your player name
   - Click "Create Game" to start a new room (generates unique Game ID)
   - Or click "Join Existing Game" and enter a Game ID to join

2. **Drawing**
   - Use color picker to choose brush color
   - Adjust brush size with the slider
   - Click and drag to draw on canvas
   - Your strokes appear in real-time for all players

3. **Game Controls**
   - **Clear Canvas**: Removes all drawings
   - **Download**: Saves the current canvas as PNG
   - **Exit Game**: Returns to lobby

4. **Game Features**
   - Timer counts down (2 minutes)
   - Player list shows connected players
   - Game status indicates current phase
   - Share Game ID with others to collaborate

## 🔧 Configuration

### Environment Variables (DrawingService/.env)

Key settings:
```env
BROADCAST_CONNECTION=reverb
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
```

### WebSocket Configuration (FrontEnd/my-react-app/src/services/websocket.js)

Update the WebSocket URL if running on different host:
```javascript
initializeEcho('your-host:8080')
```

## 📊 Data Structure

### Drawing Coordinates Model
```php
{
  id: integer,
  game_id: string,
  x: float,
  y: float,
  color: string (#RRGGBB),
  size: float,
  created_at: timestamp,
  updated_at: timestamp
}
```

### Broadcasting Event
```javascript
{
  data: {
    x: float,
    y: float,
    color: string,
    size: float
  },
  gameId: string
}
```

## 🧪 Testing

### Manual Testing
1. Open two browser windows/tabs
2. Create a game in one, join in the other (use same Game ID)
3. Draw in one window, verify strokes appear in the other

### API Testing with cURL
```bash
# Send drawing coordinates
curl -X POST http://localhost:8000/api/v1/drawing \
  -H "Content-Type: application/json" \
  -d '{
    "x": 100,
    "y": 150,
    "gameId": "game_123",
    "color": "#FF0000",
    "size": 5
  }'

# Get game drawings
curl http://localhost:8000/api/v1/drawing/game_123

# Clear canvas
curl -X DELETE http://localhost:8000/api/v1/drawing/game_123
```

## 🐛 Troubleshooting

### WebSocket Connection Error
**Error**: "Pusher client not found"
**Solution**: Already fixed in websocket.js to use socket.io-client

### Port Already in Use
Change the port in:
- Laravel: `php artisan serve --port=8001`
- Reverb: `REVERB_PORT=8081` in .env
- React: Update `vite.config.js` if needed

### Database Not Found
```bash
cd DrawingService
php artisan migrate:fresh --seed
```

### Missing Dependencies
```bash
# Backend
cd DrawingService && composer require laravel/reverb

# Frontend
cd FrontEnd/my-react-app && npm install laravel-echo socket.io-client
```

## 📈 Future Enhancements

- [ ] User authentication & accounts
- [ ] Persistent game history
- [ ] Drawing undo/redo
- [ ] Shape tools (circle, rectangle)
- [ ] Text tool for annotations
- [ ] Game scoring system
- [ ] Chat messages during game
- [ ] AI opponent
- [ ] Mobile touch support
- [ ] Dark mode

## 📝 License

MIT License - Feel free to use this project however you'd like!

## 🤝 Contributing

Contributions welcome! Feel free to:
1. Fork the repository
2. Create feature branches
3. Submit pull requests

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review the console logs (F12 in browser)
3. Check Laravel logs in `DrawingService/storage/logs/`

---

Happy Drawing! 🎨✨
