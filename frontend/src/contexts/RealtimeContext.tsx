import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface Notification {
  type: string;
  title: string;
  message: string;
  data: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  id?: string;
  read?: boolean;
}

interface RealtimeContextType {
  socket: Socket | null;
  notifications: Notification[];
  isConnected: boolean;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  markAsRead: (id: string) => void;
  unreadCount: number;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

interface RealtimeProviderProps {
  children: ReactNode;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    // Temporarily disable WebSocket connection until backend supports it
    console.log('WebSocket connection disabled - backend Socket.IO not configured');
    setIsConnected(false);
    return;

    // Create socket connection
    const newSocket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001', {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('Connected to real-time server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from real-time server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Notification events
    newSocket.on('notification', (notification: Notification) => {
      const newNotification = {
        ...notification,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date(notification.timestamp)
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      
      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo192.png',
          badge: '/logo192.png',
          tag: newNotification.id
        });
      }
    });

    // Analytics updates
    newSocket.on('analytics_update', (data) => {
      console.log('Analytics update received:', data);
      // Handle analytics updates
    });

    // User status updates
    newSocket.on('user_status_update', (data) => {
      console.log('User status update:', data);
      // Handle user status updates
    });

    // Chat messages
    newSocket.on('chat_message', (data) => {
      console.log('Chat message received:', data);
      // Handle chat messages
    });

    // Typing indicators
    newSocket.on('user_typing', (data) => {
      console.log('User typing:', data);
      // Handle typing indicators
    });

    newSocket.on('user_stop_typing', (data) => {
      console.log('User stopped typing:', data);
      // Handle stop typing
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const addNotification = (notification: Notification) => {
    const newNotification = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const value: RealtimeContextType = {
    socket,
    notifications,
    isConnected,
    addNotification,
    removeNotification,
    clearNotifications,
    markAsRead,
    unreadCount
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}; 