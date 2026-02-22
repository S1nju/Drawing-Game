import React, { useState } from 'react';

const GameLobby = ({ onStartGame }) => {
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [joinMode, setJoinMode] = useState(false);

  const handleCreateGame = (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    const newGameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    onStartGame({
      playerName: playerName.trim(),
      gameId: newGameId,
      isCreator: true,
    });
  };

  const handleJoinGame = (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!gameId.trim()) {
      alert('Please enter a game ID');
      return;
    }
    onStartGame({
      playerName: playerName.trim(),
      gameId: gameId.trim(),
      isCreator: false,
    });
  };

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <h1 className="lobby-title">🎨 Drawing Game</h1>
        <p className="lobby-subtitle">Real-time Multiplayer Drawing</p>

        <form onSubmit={joinMode ? handleJoinGame : handleCreateGame} className="lobby-form">
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
