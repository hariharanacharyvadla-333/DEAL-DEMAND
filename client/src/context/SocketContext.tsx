import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  sendMessageSocket: (chatId: string, message: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      setIsConnected(false);
      setSocket(null);
      return;
    }

    const newSocket = io(window.location.origin, {
      transports: ['polling', 'websocket'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join_user_channel', user.id);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user?.id]);

  const joinChat = (chatId: string) => {
    if (socket) {
      socket.emit('join_chat', chatId);
    }
  };

  const leaveChat = (chatId: string) => {
    if (socket) {
      socket.emit('leave_chat', chatId);
    }
  };

  const sendMessageSocket = (chatId: string, message: any) => {
    if (socket) {
      socket.emit('send_message', { chatId, message });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinChat, leaveChat, sendMessageSocket }}>
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
