import Echo from 'laravel-echo';
import io from 'socket.io-client';

let echo = null;

export const initializeEcho = (websocketUrl = 'http://localhost:8080') => {
  if (echo) {
    return echo;
  }

  try {
    // Initialize Socket.IO client
    const socket = io(websocketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });

    // Initialize Laravel Echo with Socket.IO
    echo = new Echo({
      broadcaster: 'socket.io',
      client: socket,
      host: websocketUrl,
    });

    console.log('WebSocket connection initialized successfully');
    return echo;
  } catch (error) {
    console.error('Error initializing WebSocket:', error);
    throw error;
  }
};

export const subscribeToGameDrawing = (gameId, callback) => {
  if (!echo) {
    console.warn('Echo not initialized. Please call initializeEcho first.');
    return null;
  }

  try {
    const channel = echo.private(`drawing.${gameId}`);
    
    channel.listen('drawing.update', (data) => {
      callback(data);
    });

    console.log(`Subscribed to drawing.${gameId}`);
    return channel;
  } catch (error) {
    console.error('Error subscribing to game:', error);
    return null;
  }
};

export const unsubscribeFromGame = (gameId) => {
  if (!echo) return;
  try {
    echo.leaveChannel(`private-drawing.${gameId}`);
    console.log(`Unsubscribed from drawing.${gameId}`);
  } catch (error) {
    console.error('Error unsubscribing:', error);
  }
};

export const getEcho = () => {
  return echo;
};
