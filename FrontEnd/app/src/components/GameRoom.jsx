import React, { useEffect, useState, useRef } from 'react';
import DrawingBoard from './DrawingBoard';
import Chat from './Chat';
import '../styles/GameRoom.css';
import { getUserFromCookie, saveUserToCookie } from '../utils/cookieUtils';
import useEcho from '../hooks/useEcho';

const GameRoom = ({ gameData, onBackToLobby }) => {
  const [connectedUsers, setConnectedUsers]   = useState([]);
  const [existingUser, setExistingUser]       = useState(null);
  const [gameMode, setGameMode]               = useState('normal');
  const [gameStarted, setGameStarted]         = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [currentWord, setCurrentWord]         = useState('');
  const [drawerId, setDrawerId]               = useState('');
  const [timeLeft, setTimeLeft]               = useState(60);
  const [isGameOver, setIsGameOver]           = useState(false);
  const channelRef            = useRef(null);
  const echo = useEcho();

  useEffect(() => {
    // Check if user exists in cookie
    const user = getUserFromCookie();
    if (user) {
      setExistingUser(user);
    }
  }, []);

  useEffect(() => {
    if (!echo) return;

    const userId = existingUser?.userId || gameData?.userId;
    const playerName = existingUser?.username || gameData?.playerName;
    const gameId = gameData?.gameId;
    
    if (!gameId || !userId || !playerName) return;

    // Add current user to local state immediately
    setConnectedUsers([{ id: userId, name: playerName }]);
    setConnectionStatus('connected');

    try {
      const gameChannel = echo.channel('game.' + gameId);
      channelRef.current = gameChannel;

      gameChannel.listen('.UserJoined', (event) => {
        setConnectedUsers(prev => {
          if (prev.some(u => u.id === event.user?.id)) return prev;
          return [...prev, event.user];
        });
      });

      gameChannel.listen('.UserLeft', (event) => {
        setConnectedUsers(prev => prev.filter(u => u.id !== event.user?.id));
      });

      gameChannel.listen('.GameStarted', (event) => {
        setCurrentWord(event.word);
        setDrawerId(event.drawer_id);
        setGameStarted(true);
        setTimeLeft(60);
        setIsGameOver(false);
      });

      gameChannel.listen('.TimerReduced', (event) => {
        setTimeLeft(prev => prev > event.seconds ? event.seconds : prev);
      });

      gameChannel.listen('.GameFinished', (event) => {
        setIsGameOver(true);
      });

      // Join API
      fetch('http://localhost:8000/api/game/' + gameId + '/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, user_name: playerName })
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.players)) {
          setConnectedUsers(data.players);
        }
      })
      .catch(err => console.error('Join API failed:', err));

    } catch (error) {
      console.error('Echo subscription error:', error);
    }

    return () => {
      if (gameId) echo.leave('game.' + gameId);
      channelRef.current = null;
    };
  }, [gameData, existingUser, echo]);

  // Timer logic
  useEffect(() => {
    if (!gameStarted || isGameOver || timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [gameStarted, isGameOver, timeLeft]);

  // Handle Round End
  useEffect(() => {
    if (timeLeft === 0 && gameStarted && !isGameOver && gameData?.isCreator) {
      handleNextRound();
    }
  }, [timeLeft, gameStarted, isGameOver]);

  const handleNextRound = () => {
    fetch(`http://localhost:8000/api/game/${gameData?.gameId}/next-round`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).catch(err => console.error(err));
  };

  const handleStartGame = () => {
    const userId = existingUser?.userId || gameData?.userId;
    fetch(`http://localhost:8000/api/game/${gameData?.gameId}/start`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ user_id: userId }),
    })
    .then(data => {
      setCurrentWord(data.word);
      setDrawerId(data.drawer_id);
      setGameStarted(true);

    })
    .catch(err => console.error(err));
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
        <div className="game-setup">
          <div className="players-panel">
            <div className="panel-header">
              <h3>JOUEURS {connectedUsers.length}/14</h3>
              <span style={{color: connectionStatus === 'connected' ? '#4caf50' : '#ff9800'}}>
                {connectionStatus === 'connected' ? '🟢 Connecté' : '🟡 Connexion...'}
              </span>
            </div>
            <div className="players-list">
              {connectedUsers.map((user, idx) => (
                <div key={idx} className="player-item">
                  <div className="player-avatar">👤</div>
                  <div className="player-name">{user.name || `Player ${idx + 1}`}</div>
                  {gameData?.playerName === user.name && <span className="player-badge">👑</span>}
                </div>
              ))}
            </div>
            <div className="panel-actions">
              <button className="btn btn-secondary" onClick={onBackToLobby}>← RETOUR</button>
            </div>
          </div>

          <div className="settings-panel">
            <div className="game-id-section">
              <p className="game-id-label">ROOM ID</p>
              <div className="game-id-box">
                <code className="game-id-text">{gameData?.gameId}</code>
                <button onClick={() => { navigator.clipboard.writeText(gameData?.gameId); alert('Copied!'); }} className="btn-copy">📋 COPIER</button>
              </div>
            </div>
            <div className="game-modes-grid">
              {gameModes.map(mode => (
                <div key={mode.id} className={`game-mode-card ${gameMode === mode.id ? 'active' : ''}`} onClick={() => setGameMode(mode.id)}>
                  <div className="mode-icon">{mode.icon}</div>
                  <div className="mode-name">{mode.name}</div>
                </div>
              ))}
            </div>
            <div className="game-actions">
              {gameData?.isCreator ? (
                <button className="btn btn-primary btn-large" onClick={handleStartGame} disabled={connectedUsers.length < 2}>▶ DÉMARRER</button>
              ) : (
                <p style={{textAlign: 'center', color: '#999'}}>En attente du créateur...</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="game-canvas-container">
          <div className="game-header">
            <button className="btn btn-secondary" onClick={() => setGameStarted(false)}>← RETOUR</button>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <h2>Mode: {gameMode.toUpperCase()}</h2>
              {!isGameOver && (
                <div style={{ padding: '5px 15px', backgroundColor: timeLeft <= 10 ? '#e94560' : '#00c8c8', borderRadius: '20px', color: '#0f0f23', fontWeight: 'bold', fontSize: '18px' }}>
                  ⏱ {timeLeft}s
                </div>
              )}
            </div>
            <div className="player-badge">👤 {gameData?.playerName}</div>
          </div>
          
          {isGameOver ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a2e', color: 'white', textAlign: 'center', padding: '40px' }}>
              <h1 style={{ fontSize: '48px', color: '#00c8c8' }}>GAME OVER! 🏆</h1>
              <p>All players have finished drawing.</p>
              <button className="btn btn-primary" style={{ marginTop: '30px' }} onClick={() => setGameStarted(false)}>RETURN TO LOBBY</button>
            </div>
          ) : (
            <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
              <div className="drawing-area" style={{ flex: 1 }}>
                <DrawingBoard
                  roomId={gameData?.gameId}
                  word={currentWord}
                  isDrawer={String(existingUser?.userId || gameData?.userId) === String(drawerId)}
                  userId={existingUser?.userId || gameData?.userId}
                />
              </div>
              <div style={{ width: '280px', flexShrink: 0 }}>
                <Chat
                  gameId={gameData?.gameId}
                  currentUser={{ id: existingUser?.userId || gameData?.userId, name: existingUser?.username || gameData?.playerName }}
                  drawerId={drawerId}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameRoom;
