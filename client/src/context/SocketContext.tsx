import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  sendMessageSocket: (chatId: string, message: any) => void;
  sendTyping: (chatId: string, isTyping: boolean) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      setIsConnected(false);
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const token = localStorage.getItem('dd_token');

    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      auth: { token },
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join_user_channel', user.id);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id]);

  const joinChat = useCallback((chatId: string) => {
    if (socket && chatId) {
      socket.emit('join_chat', chatId);
    }
  }, [socket]);

  const leaveChat = useCallback((chatId: string) => {
    if (socket && chatId) {
      socket.emit('leave_chat', chatId);
    }
  }, [socket]);

  const sendMessageSocket = useCallback((chatId: string, message: any) => {
    if (socket && chatId) {
      socket.emit('send_message', { chatId, message });
    }
  }, [socket]);

  const sendTyping = useCallback((chatId: string, isTyping: boolean) => {
    if (socket && chatId) {
      if (isTyping) {
        socket.emit('typing_start', { chatId, userName: user?.name });
      } else {
        socket.emit('typing_stop', { chatId });
      }
    }
  }, [socket, user?.name]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinChat,
        leaveChat,
        sendMessageSocket,
        sendTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
