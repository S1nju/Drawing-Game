import { useState, useEffect } from 'react'
import './App.css'
import GameLobby from './components/GameLobby'
import GameRoom from './components/GameRoom'
import { initializeEcho } from './services/websocket'

function App() {
  const [gameState, setGameState] = useState(null) // null, 'lobby', 'room'
  const [gameData, setGameData] = useState(null)

  useEffect(() => {
    // Initialize WebSocket connection when component mounts
    try {
      initializeEcho('localhost:8080')
      console.log('WebSocket connection initialized')
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error)
    }
  }, [])

  const handleStartGame = (data) => {
    setGameData(data)
    setGameState('room')
  }

  const handleBackToLobby = () => {
    setGameState('lobby')
    setGameData(null)
  }

  if (gameState === 'room' && gameData) {
    return (
      <GameRoom
        playerName={gameData.playerName}
        gameId={gameData.gameId}
        isCreator={gameData.isCreator}
        onBackToLobby={handleBackToLobby}
      />
    )
  }

  return (
    <GameLobby onStartGame={handleStartGame} />
  )
}

export default App
