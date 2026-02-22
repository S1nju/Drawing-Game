import { useState } from 'react'
import './App.css'
import GameLobby from './components/GameLobby'
import GameRoom from './components/GameRoom'
import DrawingBoard from './components/DrawingBoard'

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
      
      {gameState === 'room' && (
        <div className="drawing-container">
          <div className="room-header">
            <button className="btn btn-secondary" onClick={handleBackToLobby}>BS</button>
            <h2 style={{color: 'white', margin: '0 20px'}}>Room: {gameData?.gameId}</h2>
            <div className="player-badge">
              👤 {gameData?.playerName}
            </div>
          </div>
          <div className="canvas-wrapper">
            <DrawingBoard roomId={gameData?.gameId} />
          </div>
          
          <div className="tools-panel">
            {/* Placeholder for tools */}
            <div className="color-picker" style={{background: '#000'}}></div>
            <div className="color-picker" style={{background: '#ff0000'}}></div>
            <div className="color-picker" style={{background: '#00ff00'}}></div>
            <div className="color-picker" style={{background: '#0000ff'}}></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
