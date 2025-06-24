"use client";

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { io } from "socket.io-client";

// Move socket initialization outside component to prevent multiple instances
let socket = null;
const initializeSocket = () => {
  if (!socket) {
    socket = io("http://localhost:5000", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  // Add new notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      ...notification,
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // WebSocket setup
  // Add this at the beginning of the useEffect
  useEffect(() => {
    console.log('Current user object:', user); // Add this line to see the user structure
    
    const userId = user?.id || user?._id;
    if (!userId) {
      console.log('No user ID available for socket connection', user);
      return;
    }
  
    console.log('Initializing socket for user:', userId);
    const socketInstance = initializeSocket();
  
    if (!socketInstance.connected) {
      socketInstance.connect();
    }
  
    socketInstance.emit("join", userId);
  
    // Add connection debugging
    socketInstance.on('connect', () => {
      console.log('Socket connected successfully');
    });
    
    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  
    // Handle different notification types
    const handleTaskUpdated = (data) => {
      console.log('Received taskUpdated notification:', data);
      addNotification({
        type: 'task',
        title: 'Task Updated',
        message: data.message,
        icon: '📝'
      });
    };
  
    const handleTaskAssigned = (data) => {
      console.log('Received taskAssigned notification:', data);
      addNotification({
        type: 'task',
        title: 'Task Assigned',
        message: data.message,
        icon: '✅'
      });
    };
  
    const handleTaskUnassigned = (data) => {
      console.log('Received taskUnassigned notification:', data);
      addNotification({
        type: 'task',
        title: 'Task Unassigned',
        message: data.message,
        icon: '❌'
      });
    };
  
    const handleTaskAssignedToTeam = (data) => {
      console.log('Received taskAssignedToTeam notification:', data);
      addNotification({
        type: 'task',
        title: 'Task Assigned to Team',
        message: data.message,
        icon: '👥'
      });
    };
  
    const handleTeamAdded = (data) => {
      console.log('Received teamAdded notification:', data);
      addNotification({
        type: 'team',
        title: 'Team Added',
        message: data.message,
        icon: '🎉'
      });
    };
  
    const handleTeamRemoved = (data) => {
      console.log('Received teamRemoved notification:', data);
      addNotification({
        type: 'team',
        title: 'Team Removed',
        message: data.message,
        icon: '🗑️'
      });
    };
  
    const handleTeamUpdated = (data) => {
      console.log('Received teamUpdated notification:', data);
      addNotification({
        type: 'team',
        title: 'Team Updated',
        message: data.message,
        icon: '🔄'
      });
    };
  
    // Add event listeners
    socketInstance.on("taskUpdated", handleTaskUpdated);
    socketInstance.on("taskAssigned", handleTaskAssigned);
    socketInstance.on("taskUnassigned", handleTaskUnassigned);
    socketInstance.on("taskAssignedToTeam", handleTaskAssignedToTeam);
    socketInstance.on("teamAdded", handleTeamAdded);
    socketInstance.on("teamRemoved", handleTeamRemoved);
    socketInstance.on("teamUpdated", handleTeamUpdated);
  
    return () => {
      socketInstance.off("taskUpdated", handleTaskUpdated);
      socketInstance.off("taskAssigned", handleTaskAssigned);
      socketInstance.off("taskUnassigned", handleTaskUnassigned);
      socketInstance.off("taskAssignedToTeam", handleTaskAssignedToTeam);
      socketInstance.off("teamAdded", handleTeamAdded);
      socketInstance.off("teamRemoved", handleTeamRemoved);
      socketInstance.off("teamUpdated", handleTeamUpdated);
    };
  }, [user, addNotification]); // Changed dependency from user?._id to user

  // Add this function to the NotificationProvider
  const addTestNotification = useCallback(() => {
    addNotification({
      type: 'test',
      title: 'Test Notification',
      message: 'This is a test notification',
      icon: '🔔'
    });
  }, [addNotification]);
  
  // Add to the context value
  const value = {
    notifications,
    unreadCount,
    addNotification,
    addTestNotification, // Add this
    markAsRead,
    markAllAsRead,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};