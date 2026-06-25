'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  userId?: string;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
}

interface SocketStatus {
  connected: boolean;
  reconnecting: boolean;
  reconnectAttempts: number;
  error: string | null;
}

export function useSocketWithReconnection({
  userId,
  autoReconnect = true,
  maxReconnectAttempts = 5,
}: UseSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const [status, setStatus] = useState<SocketStatus>({
    connected: false,
    reconnecting: false,
    reconnectAttempts: 0,
    error: null,
  });

  const connect = () => {
    if (socketRef.current?.connected) return;

    const socket = io({
      path: '/api/socket',
      transports: ['websocket'],
      reconnection: false, // We handle reconnection manually
      timeout: 10000,
    });

    socketRef.current = socket;

    // Connection successful
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      reconnectAttemptsRef.current = 0;

      setStatus({
        connected: true,
        reconnecting: false,
        reconnectAttempts: 0,
        error: null,
      });

      // Re-join user room after reconnection
      if (userId) {
        socket.emit('join-user-room', userId);
      }
    });

    // Connection error
    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      
      setStatus(prev => ({
        ...prev,
        connected: false,
        error: error.message,
      }));

      if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
        attemptReconnect();
      }
    });

    // Disconnection
    socket.on('disconnect', (reason) => {
      console.log('⚠️ Socket disconnected:', reason);
      
      setStatus(prev => ({
        ...prev,
        connected: false,
      }));

      if (autoReconnect && reason !== 'io client disconnect') {
        attemptReconnect();
      }
    });

    return socket;
  };

  const attemptReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectAttemptsRef.current += 1;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000); // Exponential backoff, max 30s

    setStatus(prev => ({
      ...prev,
      reconnecting: true,
      reconnectAttempts: reconnectAttemptsRef.current,
    }));

    console.log(`🔄 Attempting reconnection #${reconnectAttemptsRef.current} in ${delay}ms`);

    reconnectTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.connect();
      } else {
        connect();
      }
    }, delay);
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setStatus({
      connected: false,
      reconnecting: false,
      reconnectAttempts: 0,
      error: null,
    });
  };

  const manualReconnect = () => {
    reconnectAttemptsRef.current = 0;
    disconnect();
    connect();
  };

  // Initialize connection
  useEffect(() => {
    if (!userId) return;

    const socket = connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket) {
        socket.disconnect();
      }
    };
  }, [userId]);

  return {
    socket: socketRef.current,
    status,
    connect,
    disconnect,
    manualReconnect,
  };
}
