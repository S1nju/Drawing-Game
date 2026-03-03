import React, { useEffect, useState, useRef } from 'react';
import DrawingBoard from './DrawingBoard';
import '../styles/GameRoom.css';
import { getUserFromCookie, saveUserToCookie } from '../utils/cookieUtils';
import useEcho from '../hooks/useEcho';
const GameRoom = ({ gameData, onBackToLobby }) => {
  const [connectedUsers, setConnectedUsers] = useState([])
  const [existingUser, setExistingUser] = useState(null);
  const [gameMode, setGameMode] = useState('normal');
  const [gameStarted, setGameStarted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const channelRef = useRef(null);
  const connectionCheckedRef = useRef(false);
  const echo = useEcho();
  useEffect(() => {
    // Check if user exists in cookie
    const user = getUserFromCookie();
    if (user) {
      setExistingUser(user);
    }
  }, []);

  // Separate effect for connection monitoring
  
  useEffect(() => {
    if (!echo) return; // Wait for Echo to initialize

    const handleConnection = () => {
      console.log('✓ Echo connected');
      setConnectionStatus('connected');
    };
    const userId = existingUser?.userId || gameData?.userId;
    const playerName = existingUser?.username || gameData?.playerName;
    const gameId = gameData?.gameId;
    
    if (!gameId || !userId || !playerName) {
      console.warn('Missing required data:', { gameId, userId, playerName });
      return;
    }
    // Add current user to local state immediately
    const currentUserData = {
      id: userId,
      name: playerName,
      avatar: '👤'
    };
    setConnectedUsers([currentUserData]);
        try {
          // Subscribe to channel
          const gameChannel = echo.join('game.' + gameId);
          channelRef.current = gameChannel;
          console.log('✓ Subscribed to channel: game.' + gameId);
          console.log('Echo Socket ID:', echo.socketId());

          // Register event listeners
          gameChannel.listen('UserJoined', (event) => {
            console.log('✓ UserJoined event received:', event);
            setConnectedUsers(prev => {
              const userExists = prev.some(u => u.id === event.user?.id);
              if (userExists) {
                console.log('→ User already exists, skipping');
                return prev;
              }
              console.log('→ Adding user to connected list:', event.user);
              return [...prev, event.user];
            });
          });

          gameChannel.listen('UserLeft', (event) => {
            console.log('✓ UserLeft event received:', event);
            setConnectedUsers(prev => {
              const filtered = prev.filter(u => u.id !== event.user?.id);
              console.log('→ Removed user, remaining:', filtered.length);
              return filtered;
            });
          });

          // Small delay to ensure listeners are registered before notifying backend
          setTimeout(() => {
            console.log('>> Listeners registered, notifying backend...');
            
            fetch('http://localhost:8000/api/game/' + gameId + '/join', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: userId, user_name: playerName })
            })
              .then(res => res.json())
              .then(data => {
                console.log('✓ Backend join response:', data);
              })
              .catch(err => {
                console.error('✗ Failed to notify backend:', err);
              });
          }, 200);

        } catch (error) {
          console.error('✗ Failed to subscribe to channel:', error);
        }
      } 
  , [gameData, existingUser, echo]);

  const handleStartGame = () => {
    setGameStarted(true);
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
      {connectionStatus === 'timeout' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          color: 'white',
          fontSize: '18px'
        }}>
          <div style={{backgroundColor: '#333', padding: '30px', borderRadius: '10px'}}>
            <p>⚠️ Connection timeout</p>
            <p>Check console for details</p>
            <button onClick={onBackToLobby} style={{marginTop: '20px', padding: '10px 20px'}}>
              Back to Lobby
            </button>
          </div>
        </div>
      )}

      {!gameStarted ? (
        <div className="game-setup">
          {/* Left side - Connected Players */}
          <div className="players-panel">
            <div className="panel-header">
              <h3>JOUEURS {connectedUsers.length}/14</h3>
              <span style={{fontSize: '12px', color: connectionStatus === 'connected' ? '#4caf50' : '#ff9800'}}>
                {connectionStatus === 'connected' ? '🟢 Connecté' : '🟡 Connexion...'}
              </span>
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
