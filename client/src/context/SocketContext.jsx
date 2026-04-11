import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  // 👉 URL dynamique (local / production)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  useEffect(() => {
    const socketInstance = io(API_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      setConnected(true);
      console.log('✅ Connected to server:', API_URL);
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
      console.log('❌ Disconnected from server');
    });

    socketInstance.on('connect_error', (err) => {
      console.error('⚠️ Connection error:', err.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [API_URL]);

  return (
      <SocketContext.Provider value={{ socket, connected }}>
        {children}
      </SocketContext.Provider>
  );
};