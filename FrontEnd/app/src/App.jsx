import { useState } from 'react'
import './App.css'
import GameLobby from './components/GameLobby'
import GameRoom from './components/GameRoom'

function App() {
  const [gameState, setGameState] = useState('lobby') // 'lobby', 'room'
  const [gameData, setGameData] = useState(null)

  const handleStartGame = (data) => {
    setGameData(data)
    setGameState('room')
  }

  const handleBackToLobby = () => {
    setGameState('lobby')
    setGameData(null)
  }

  return (
    <div className="app-container">
      {gameState === 'lobby' && (
        <GameLobby onStartGame={handleStartGame} />
      )}
      
      {gameState === 'room' && gameData && (
        <GameRoom gameData={gameData} onBackToLobby={handleBackToLobby} />
      )}
    </div>
  )
}

export default App
