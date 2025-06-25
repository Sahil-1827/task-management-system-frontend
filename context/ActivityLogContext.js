"use client"
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { activityLogService } from '../services/activityLogService';
import { useAuth } from './AuthContext';
import { io } from "socket.io-client"; // Import socket.io-client

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

const ActivityLogContext = createContext();

export const ActivityLogProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchLogs = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const data = await activityLogService.getLogs(filters);
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // WebSocket setup for real-time activity log updates
  useEffect(() => {
    const userId = user?.id || user?._id;
    if (!userId) {
      console.log('No user ID available for socket connection in ActivityLogContext');
      return;
    }

    console.log('Initializing socket for activity logs for user:', userId);
    const socketInstance = initializeSocket();

    if (!socketInstance.connected) {
      socketInstance.connect();
    }

    socketInstance.emit("join", userId);

    const handleActivityUpdate = (data) => {
      console.log('Received activity update:', data);
      fetchLogs(); // Re-fetch logs on any activity update
    };

    // Listen for specific events that indicate an activity log change
    socketInstance.on("taskUpdated", handleActivityUpdate);
    socketInstance.on("taskAssigned", handleActivityUpdate);
    socketInstance.on("taskUnassigned", handleActivityUpdate);
    socketInstance.on("taskAssignedToTeam", handleActivityUpdate);
    socketInstance.on("teamAdded", handleActivityUpdate);
    socketInstance.on("teamRemoved", handleActivityUpdate);
    socketInstance.on("teamUpdated", handleActivityUpdate);
    socketInstance.on("userLoggedIn", handleActivityUpdate); // Assuming this also generates an activity log
    socketInstance.on("userLoggedOut", handleActivityUpdate); // Assuming this also generates an activity log
    socketInstance.on("userRegistered", handleActivityUpdate); // Assuming this also generates an activity log

    return () => {
      // Clean up event listeners on component unmount or user change
      socketInstance.off("taskUpdated", handleActivityUpdate);
      socketInstance.off("taskAssigned", handleActivityUpdate);
      socketInstance.off("taskUnassigned", handleActivityUpdate);
      socketInstance.off("taskAssignedToTeam", handleActivityUpdate);
      socketInstance.off("teamAdded", handleActivityUpdate);
      socketInstance.off("teamRemoved", handleActivityUpdate);
      socketInstance.off("teamUpdated", handleActivityUpdate);
      socketInstance.off("userLoggedIn", handleActivityUpdate);
      socketInstance.off("userLoggedOut", handleActivityUpdate);
      socketInstance.off("userRegistered", handleActivityUpdate);
    };
  }, [user, fetchLogs]);

  // Get filtered logs based on user role
  const getAccessibleLogs = useCallback(() => {
    if (!user) return [];

    // Removed role-based filtering to allow all users to see all logs
    return logs; 

    // switch (user.role) {
    //   case 'admin':
    //     return logs; // Admins see all logs
    //   case 'manager':
    //     // Managers see logs related to their teams and tasks
    //     return logs.filter(log => {
    //       return (
    //         log.performedBy === user._id ||
    //         (user.teams || []).includes(log.entityId) ||
    //         (user.managedTasks || []).includes(log.entityId)
    //       );
    //     });
    //   default:
    //     // Regular users see only their own logs
    //     return logs.filter(log => log.performedBy === user._id);
    // }
  }, [logs, user]);

  return (
    <ActivityLogContext.Provider
      value={{
        logs: getAccessibleLogs(),
        loading,
        fetchLogs,
      }}
    >
      {children}
    </ActivityLogContext.Provider>
  );
};

export const useActivityLog = () => useContext(ActivityLogContext);