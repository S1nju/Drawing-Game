import React, { useEffect, useState, useRef } from 'react';
import echo from '../hooks/useEcho';
import DrawingBoard from './DrawingBoard';
import '../styles/GameRoom.css';
import { getUserFromCookie, saveUserToCookie } from '../utils/cookieUtils';
const GameRoom = ({ gameData, onBackToLobby }) => {
  const [connectedUsers, setConnectedUsers] = useState([])
  const [existingUser, setExistingUser] = useState(null);
  const [gameMode, setGameMode] = useState('normal');
  const [gameStarted, setGameStarted] = useState(false);
  const channelRef = useRef(null);
  useEffect(() => {
      // Check if user exists in cookie
      const user = getUserFromCookie();
      if (user) {
        setExistingUser(user);
// Show direct game setup, skip name entry
      }
    }, []);
  
  useEffect(() => {
    const userId = existingUser?.userId || gameData?.userId;
    const playerName = existingUser?.username || gameData?.playerName;
    const gameId = gameData?.gameId;
    
    console.log('Setting up game room for:', { gameId, userId, playerName });
    console.log('Echo connector:', echo.connector);
    console.log('Echo connection state:', echo.connector?.connected);

    // Add current user to local state immediately
    const currentUserData = {
      id: userId || Math.random().toString(36).substr(2, 9),
      name: playerName,
      avatar: '👤'
    };
    setConnectedUsers([currentUserData]);

    // Wait for Echo to be connected before subscribing
    const waitForConnection = setInterval(() => {
      if (echo.connector?.connected) {
        clearInterval(waitForConnection);
        console.log('Echo connected, subscribing to channel');
        
        // Setup Reverb channel listeners
        let gameChannel;
        try {
          gameChannel = echo.channel('game.' + gameId);
          console.log('Channel setup:', 'game.' + gameId);
          console.log('Echo socket ID:', echo.socketId());
          
          gameChannel
            .listen('UserJoined', (event) => {
              console.log('User joined event received:', event);
              setConnectedUsers(prev => {
                const exists = prev.some(u => u.id === event.user?.id);
                if (exists) return prev;
                console.log('Adding user to list:', event.user);
                return [...prev, event.user];
              });
            })
            .listen('UserLeft', (event) => {
              console.log('User left event received:', event);
              setConnectedUsers(prev => {
                const filtered = prev.filter(u => u.id !== event.user?.id);
                console.log('Removing user from list:', event.user);
                return filtered;
              });
            });

          channelRef.current = gameChannel;
          
          // Give Reverb server 500ms to register the listener before notifying backend
          setTimeout(() => {
            // THEN notify backend that player joined
            const notifyJoin = async () => {
              try {
                console.log('Notifying backend - join');
                const response = await fetch('http://localhost:8000/api/game/' + gameId + '/join', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    user_id: userId,
                    user_name: playerName,
                  })
                });
                const data = await response.json();
                console.log('Join response:', data);
              } catch (error) {
                console.error('Failed to notify join:', error);
              }
            };

            notifyJoin();
          }, 500); // 500ms delay
        } catch (error) {
          console.error('Failed to setup channel:', error);
        }
      }
    }, 100); // Check every 100ms

    return () => {
      clearInterval(waitForConnection);
      
      // Notify backend that player left
      const notifyLeave = async () => {
        try {
          console.log('Notifying backend - leave');
          const response = await fetch('http://localhost:8000/api/game/' + gameId + '/leave', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userId,
              user_name: playerName,
            })
          });
          const data = await response.json();
          console.log('Leave response:', data);
        } catch (error) {
          console.error('Error notifying leave:', error);
        }
      };

      notifyLeave();

      if (channelRef.current) {
        try {
          echo.leaveChannel('game.' + gameId);
          console.log('Left channel:', 'game.' + gameId);
        } catch (e) {
          console.warn('Error leaving channel:', e);
        }
        channelRef.current = null;
      }
    };
  }, [gameData?.gameId, gameData?.userId, gameData?.playerName, existingUser]);

  const handleStartGame = () => {
    setGameStarted(true);
    // Broadcast game start to all users
    if (channelRef.current) {
      channelRef.current.whisper('gameStart', {
        mode: gameMode,
        creator: gameData?.playerName,
      });
    }
  };

  const gameModes = [
    { id: 'normal', name: 'NORMAL', icon: '🎨' },
    { id: 'speedrun', name: 'SPEEDRUN', icon: '⚡' },
    { id: 'imitation', name: 'IMITATION', icon: '🎭' },
    { id: 'secret', name: 'SECRET', icon: '🤫' },
    { id: 'sandwich', name: 'SANDWICH', icon: '📦' },
    { id: 'crazy', name: 'CRAZY', icon: '🤪' },
  ];

  return (
    <div className="game-room-container">
      {!gameStarted ? (
        // Game setup view (split layout)
        <div className="game-setup">
          {/* Left side - Connected Players */}
          <div className="players-panel">
            <div className="panel-header">
              <h3>JOUEURS {connectedUsers.length}/14</h3>
            </div>
            
            <div className="players-list">
              {connectedUsers.map((user, idx) => (
                <div key={idx} className="player-item">
                  <div className="player-avatar">👤</div>
                  <div className="player-name">{user.name || `Player ${idx + 1}`}</div>
                  {gameData?.playerName === user.name && (
                    <span className="player-badge">👑</span>
                  )}
                </div>
              ))}
              
              {/* Empty slots */}
              {[...Array(Math.max(0, 14 - connectedUsers.length))].map((_, idx) => (
                <div key={`empty-${idx}`} className="player-item empty">
                  <div className="player-avatar">⭕</div>
                  <div className="player-name">VIDE</div>
                </div>
              ))}
            </div>

            <div className="panel-actions">
              <button className="btn btn-secondary" onClick={onBackToLobby}>
                ← RETOUR
              </button>
            </div>
          </div>

          {/* Right side - Game Settings */}
          <div className="settings-panel">
            {/* Game ID Display */}
            <div className="game-id-section">
              <p className="game-id-label">ROOM ID</p>
              <div className="game-id-box">
                <code className="game-id-text">{gameData?.gameId}</code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(gameData?.gameId);
                    alert('Game ID copied to clipboard!');
                  }}
                  className="btn-copy"
                  title="Copy to clipboard"
                >
                  📋 COPIER
                </button>
              </div>
            </div>

            <div className="settings-tabs">
              <div className="tab active">PRÉRÉGLAGES</div>
              <div className="tab">PERSONNALISATIONS</div>
            </div>

            <div className="game-modes-grid">
              {gameModes.map((mode) => (
                <div
                  key={mode.id}
                  className={`game-mode-card ${gameMode === mode.id ? 'active' : ''}`}
                  onClick={() => setGameMode(mode.id)}
                >
                  <div className="mode-icon">{mode.icon}</div>
                  <div className="mode-name">{mode.name}</div>
                </div>
              ))}
            </div>

            <div className="mode-description">
              <p>Mode sélectionné: <strong>{gameMode.toUpperCase()}</strong></p>
              <p style={{fontSize: '12px', color: '#666'}}>
                Joueurs: {connectedUsers.length}/14
              </p>
            </div>

            <div className="game-actions">
              {gameData?.isCreator && (
                <button 
                  className="btn btn-primary btn-large"
                  onClick={handleStartGame}
                  disabled={connectedUsers.length < 2}
                >
                  ▶ DÉMARRER
                </button>
              )}
              {!gameData?.isCreator && (
                <p style={{textAlign: 'center', color: '#999'}}>
                  En attente du créateur...
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Game drawing view
        <div className="game-canvas-container">
          <div className="game-header">
            <button className="btn btn-secondary" onClick={() => setGameStarted(false)}>
              ← RETOUR
            </button>
            <h2>Mode: {gameMode.toUpperCase()}</h2>
            <div className="player-badge">👤 {gameData?.playerName}</div>
          </div>
          <div className="drawing-area">
            <DrawingBoard roomId={gameData?.gameId} />
          </div>
          <div className="players-sidebar-right">
            <div className="sidebar-header">Joueurs</div>
            {connectedUsers.map((user, idx) => (
              <div key={idx} className="sidebar-player">
                👤 {user.name || `Player ${idx + 1}`}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameRoom;
