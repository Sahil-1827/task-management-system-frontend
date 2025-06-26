"use client";

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { io } from "socket.io-client";
import EditNoteIcon from '@mui/icons-material/EditNote';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import CancelIcon from '@mui/icons-material/Cancel';
import GroupsIcon from '@mui/icons-material/Groups';
import CelebrationIcon from '@mui/icons-material/Celebration';
import DeleteIcon from '@mui/icons-material/Delete';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import NotificationsIcon from '@mui/icons-material/Notifications';
// Move socket initialization outside component to prevent multiple instances
let socket = null;
const initializeSocket = () => {
  if (!socket) {
    socket = io("http://localhost:8080", {
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
    console.log('Current user object:', user);
    
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
      addNotification({
        type: 'task',
        title: 'Task Updated',
        message: data.message,
        icon: <EditNoteIcon />
      });
    };
  
    const handleTaskAssigned = (data) => {
      addNotification({
        type: 'task',
        title: 'Task Assigned',
        message: data.message,
        icon: <TaskAltIcon />
      });
    };
  
    const handleTaskUnassigned = (data) => {
      addNotification({
        type: 'task',
        title: 'Task Unassigned',
        message: data.message,
        icon: <CancelIcon />
      });
    };
  
    const handleTaskAssignedToTeam = (data) => {
      addNotification({
        type: 'task',
        title: 'Task Assigned to Team',
        message: data.message,
        icon: <GroupsIcon />
      });
    };
  
    const handleTeamAdded = (data) => {
      addNotification({
        type: 'team',
        title: 'Team Added',
        message: data.message,
        icon: <CelebrationIcon />
      });
    };
  
    const handleTeamRemoved = (data) => {
      addNotification({
        type: 'team',
        title: 'Team Removed',
        message: data.message,
        icon: <DeleteIcon />
      });
    };
  
    const handleTeamUpdated = (data) => {
      addNotification({
        type: 'team',
        title: 'Team Updated',
        message: data.message,
        icon: <AutorenewIcon />
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
  }, [user, addNotification]);

  // Add this function to the NotificationProvider
  const addTestNotification = useCallback(() => {
    addNotification({
      type: 'test',
      title: 'Test Notification',
      message: 'This is a test notification',
      icon: <NotificationsIcon />
    });
  }, [addNotification]);
  
  // Add to the context value
  const value = {
    notifications,
    unreadCount,
    addNotification,
    addTestNotification,
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