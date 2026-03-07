import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getUserFromCookie, saveUserToCookie } from '../utils/cookieUtils';

const GameLobby = ({ onStartGame }) => {
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [joinMode, setJoinMode] = useState(false);
  const [existingUser, setExistingUser] = useState(null);
  const [showGameSetup, setShowGameSetup] = useState(true);

  useEffect(() => {
    // Check if user exists in cookie
    const user = getUserFromCookie();
    if (user) {
      setExistingUser(user);
      setPlayerName(user.username);
      setShowGameSetup(true); // Show direct game setup, skip name entry
    }
  }, []);


   const handleCreateGame = async(e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    const newGameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // If user already exists in cookie, skip API call
    if (existingUser) {
      saveUserToCookie(existingUser.username, existingUser.userId);
      onStartGame({
        playerName: existingUser.username,
        gameId: newGameId,
        isCreator: true,
        userId: existingUser.userId,
      });
      return;
    }
    
    // Otherwise, create new user via API
    await axios.post('http://localhost:3001/users', {username: playerName.trim()}).then((res)=>{
      console.log(res)
      alert('User created successfully');
      // Save user to cookie for future use
      saveUserToCookie(res.data.user.username, res.data.user.id);
      onStartGame({
        playerName: res.data.user.username,
        gameId: newGameId,
        isCreator: true,
        userId: res.data.user.id,
      });
    }).catch((err)=>{
      alert(err);
      console.log(err);
      return null;
    });
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
    
    // Get or create userId for this session
    let userId = existingUser?.userId;
    if (!userId) {
      // Generate a new temporary userId if user doesn't have one
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    onStartGame({
      playerName: playerName.trim(),
      gameId: gameId.trim(),
      isCreator: false,
      userId: userId,
    });
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
