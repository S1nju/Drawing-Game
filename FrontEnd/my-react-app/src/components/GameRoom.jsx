import React, { useEffect, useState, useRef } from 'react';
import DrawingBoard from './DrawingBoard';
import { subscribeToGameDrawing } from '../services/websocket';

const GameRoom = ({ playerName, gameId, isCreator, onBackToLobby }) => {
  const [connectedPlayers, setConnectedPlayers] = useState([playerName]);
  const [gameStatus, setGameStatus] = useState('drawing'); // drawing, waiting, finished
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes
  const drawingBoardRef = useRef(null);
  const channelRef = useRef(null);

  useEffect(() => {
    // Subscribe to game drawing events
    try {
      const channel = subscribeToGameDrawing(gameId, (data) => {
        // Handle incoming drawing data
        if (drawingBoardRef.current && data.data) {
          drawingBoardRef.current.drawRemoteStroke(data.data);
        }
      });

      channelRef.current = channel;
    } catch (error) {
      console.error('Failed to subscribe to drawing channel:', error);
    }

    // Simulate timer countdown
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setGameStatus('finished');
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [gameId]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClearCanvas = async () => {
    try {
      await fetch(`/api/v1/drawing/${gameId}`, {
        method: 'DELETE',
      });
      if (drawingBoardRef.current) {
        drawingBoardRef.current.clearCanvas();
      }
    } catch (error) {
      console.error('Error clearing canvas:', error);
    }
  };

  const handleExitGame = () => {
    onBackToLobby();
  };

  return (
    <div className="game-room">
      <div className="game-header">
        <div className="game-info">
          <h2 className="game-title">🎨 Drawing Game</h2>
          <div className="game-details">
            <span className="game-id">Game ID: {gameId}</span>
            <span className="player-count">👥 Players: {connectedPlayers.length}</span>
            <span className="game-status">Status: {gameStatus}</span>
          </div>
        </div>

        <div className="game-controls">
          <div className="timer">
            <span className="timer-label">Time Remaining:</span>
            <span className={`timer-value ${timeRemaining < 30 ? 'warning' : ''}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>

          <button onClick={handleExitGame} className="btn btn-secondary">
            Exit Game
          </button>
        </div>
      </div>

      <div className="game-content">
        <div className="drawing-section">
          <DrawingBoard
            ref={drawingBoardRef}
            gameId={gameId}
            playerName={playerName}
            onClear={handleClearCanvas}
          />
        </div>

        <div className="game-sidebar">
          <div className="players-panel">
            <h3>Players ({connectedPlayers.length})</h3>
            <ul className="players-list">
              {connectedPlayers.map((player, index) => (
                <li key={index} className="player-item">
                  <span className="player-avatar">👤</span>
                  <span className="player-name">
                    {player}
                    {player === playerName && <span className="you-badge">(You)</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="game-stats">
            <h3>Game Stats</h3>
            <div className="stat-item">
              <span className="stat-label">Score:</span>
              <span className="stat-value">0</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Rounds:</span>
              <span className="stat-value">1/3</span>
            </div>
          </div>

          {isCreator && (
            <button className="btn btn-primary btn-block">
              Start Next Round
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameRoom;
