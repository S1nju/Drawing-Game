import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getUserFromCookie, saveUserToCookie } from '../utils/cookieUtils';

const AUTH_API_BASE = 'http://127.0.0.1:3001';
const GAME_API_BASE = 'http://127.0.0.1:3000';
const DRAWING_API_BASE = 'http://127.0.0.1:8000/api';

const GameLobby = ({ onStartGame }) => {
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [joinMode, setJoinMode] = useState(false);
  const [existingUser, setExistingUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingGame, setCreatingGame] = useState(false);
  const [gameSettings, setGameSettings] = useState({
    maxPlayers: 8,
    totalRounds: 3,
    turnTime: 60,
  });

  useEffect(() => {
    // Check if user exists in cookie
    const user = getUserFromCookie();
    if (user) {
      setExistingUser(user);
      setPlayerName(user.username);
    }
  }, []);


  const ensureUser = async () => {
    if (existingUser?.userId) {
      saveUserToCookie(existingUser.username, existingUser.userId);
      return existingUser;
    }

    const username = playerName.trim();
    const res = await axios.post(`${AUTH_API_BASE}/users`, { username });
    const createdUser = {
      username: res.data.user.username,
      userId: String(res.data.user.id),
    };

    saveUserToCookie(createdUser.username, createdUser.userId);
    setExistingUser(createdUser);
    return createdUser;
  };


  const handleCreateGame = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    setShowCreateModal(true);
  };

  const handleSettingsChange = (field, value) => {
    setGameSettings((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  };

  const submitCreateGame = async () => {
    if (
      !Number.isInteger(gameSettings.maxPlayers) ||
      !Number.isInteger(gameSettings.totalRounds) ||
      !Number.isInteger(gameSettings.turnTime) ||
      gameSettings.maxPlayers < 2 ||
      gameSettings.maxPlayers > 14 ||
      gameSettings.totalRounds < 1 ||
      gameSettings.totalRounds > 10 ||
      gameSettings.turnTime < 15 ||
      gameSettings.turnTime > 180
    ) {
      alert('Invalid settings. Use: players 2-14, rounds 1-10, turn time 15-180s.');
      return;
    }

    try {
      setCreatingGame(true);
      const user = await ensureUser();

      const gameRes = await axios.post(`${GAME_API_BASE}/game`, {
        maxPlayers: gameSettings.maxPlayers,
        totalRounds: gameSettings.totalRounds,
        turnTime: gameSettings.turnTime,
      });

      setShowCreateModal(false);
      onStartGame({
        playerName: user.username,
        gameId: gameRes.data.gameId,
        isCreator: true,
        userId: user.userId,
        maxPlayers: gameRes.data.maxPlayers,
        totalRounds: gameRes.data.totalRounds,
        turnTime: gameRes.data.turnTime,
      });
    } catch (err) {
      console.error('Create game failed:', err);
      alert('Failed to create game. Check game-service and auth-service.');
    } finally {
      setCreatingGame(false);
    }
  };

  const handleJoinGame = async(e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!gameId.trim()) {
      alert('Please enter a game ID');
      return;
    }
    
    const cleanGameId = gameId.trim();

    try {
      const user = await ensureUser();
      const infoRes = await axios.get(`${DRAWING_API_BASE}/game/${cleanGameId}/lobby-info`);
      const info = infoRes.data;

      if (info?.isFull) {
        alert(`Lobby is full (${info.playersCount}/${info.maxPlayers}).`);
        return;
      }

      onStartGame({
        playerName: user.username,
        gameId: cleanGameId,
        isCreator: false,
        userId: user.userId,
        maxPlayers: info.maxPlayers,
        totalRounds: info.totalRounds,
        turnTime: info.turnTime,
        status: info.status,
      });
    } catch (err) {
      console.error('Join game pre-check failed:', err);
      const apiMessage = err?.response?.data?.error;
      alert(apiMessage || 'Unable to join this game. Check the game ID and server status.');
    }
  };

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <h1 className="lobby-title">🎨 Drawing Game</h1>
        <p className="lobby-subtitle">Real-time Multiplayer Drawing</p>

        {/* Show existing user info if user exists in cookie */}
        {existingUser && (
          <div className="existing-user-info" style={{
            backgroundColor: '#e8f5e9',
            border: '2px solid #4caf50',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p style={{margin: '0 0 10px 0', fontSize: '14px', color: '#666'}}>Welcome back!</p>
            <p style={{margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#2e7d32'}}>
              👤 {existingUser.username}
            </p>
          </div>
        )}

        <form onSubmit={joinMode ? handleJoinGame : handleCreateGame} className="lobby-form">
          {/* Only show name input if user doesn't exist in cookie */}
          {!existingUser && (
            <div className="form-group">
              <label htmlFor="playerName">Your Name:</label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="form-input"
                maxLength="20"
              />
            </div>
          )}

          {joinMode && (
            <div className="form-group">
              <label htmlFor="gameId">Game ID:</label>
              <input
                id="gameId"
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                placeholder="Enter game ID to join"
                className="form-input"
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-large">
            {joinMode ? 'Join Game' : 'Create Game'}
          </button>
        </form>

        <div className="lobby-divider">
          <span>OR</span>
        </div>

        <button
          onClick={() => setJoinMode(!joinMode)}
          className="btn btn-secondary btn-large"
        >
          {joinMode ? 'Create New Game' : 'Join Existing Game'}
        </button>

        {joinMode && (
          <div className="game-id-info">
            <p>📋 Share this game ID with others to let them join:</p>
            <code className="game-id-display">game_XXXXX_XXXXX</code>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="setup-modal-overlay" onClick={() => !creatingGame && setShowCreateModal(false)}>
          <div className="setup-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="setup-modal-title">Game Settings</h2>
            <p className="setup-modal-subtitle">Choose round settings before creating your room.</p>

            <div className="setup-field">
              <label htmlFor="maxPlayers">Max Players (2-14)</label>
              <input
                id="maxPlayers"
                type="number"
                min="2"
                max="14"
                value={gameSettings.maxPlayers}
                onChange={(e) => handleSettingsChange('maxPlayers', e.target.value)}
                className="form-input"
              />
            </div>

            <div className="setup-field">
              <label htmlFor="totalRounds">Total Rounds (1-10)</label>
              <input
                id="totalRounds"
                type="number"
                min="1"
                max="10"
                value={gameSettings.totalRounds}
                onChange={(e) => handleSettingsChange('totalRounds', e.target.value)}
                className="form-input"
              />
            </div>

            <div className="setup-field">
              <label htmlFor="turnTime">Turn Time in Seconds (15-180)</label>
              <input
                id="turnTime"
                type="number"
                min="15"
                max="180"
                value={gameSettings.turnTime}
                onChange={(e) => handleSettingsChange('turnTime', e.target.value)}
                className="form-input"
              />
            </div>

            <div className="setup-modal-actions">
              <button
                type="button"
                className="btn btn-secondary btn-large"
                onClick={() => setShowCreateModal(false)}
                disabled={creatingGame}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-large"
                onClick={submitCreateGame}
                disabled={creatingGame}
              >
                {creatingGame ? 'Creating...' : 'Create Game'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="lobby-features">
        <div className="feature">
          <span className="feature-icon">🎯</span>
          <span className="feature-text">Real-time Multiplayer Drawing</span>
        </div>
        <div className="feature">
          <span className="feature-icon">🎨</span>
          <span className="feature-text">Multiple Colors & Brushes</span>
        </div>
        <div className="feature">
          <span className="feature-icon">⚡</span>
          <span className="feature-text">Instant Synchronization</span>
        </div>
      </div>
      
   
    </div>
  );
};

export default GameLobby;
