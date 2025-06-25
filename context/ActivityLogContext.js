"use client"
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { activityLogService } from '../services/activityLogService';
import { useAuth } from './AuthContext';
import { io } from "socket.io-client";

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
  const { user, token } = useAuth();
  const [userEntities, setUserEntities] = useState({ taskIds: [], teamIds: [] });

  // Fetch all logs from the server
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

  // For regular users, fetch IDs of their associated tasks and teams
  useEffect(() => {
    if (!user || !token || user.role === 'admin' || user.role === 'manager') {
        setUserEntities({ taskIds: [], teamIds: [] });
        return;
    }

    const fetchUserEntities = async () => {
        try {
            const [tasksRes, teamsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/tasks', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/teams', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            
            const allTasks = tasksRes.data.tasks || tasksRes.data;
            const myTaskIds = allTasks
                .filter(task => task.assignee?._id === user._id)
                .map(task => task._id);

            const allTeams = teamsRes.data.teams || teamsRes.data;
            const myTeamIds = allTeams
                .filter(team => team.members.some(member => member._id === user._id))
                .map(team => team._id);

            setUserEntities({ taskIds: myTaskIds, teamIds: myTeamIds });

        } catch (error) {
            console.error('Error fetching user entities for activity log:', error);
        }
    };

    fetchUserEntities();
  }, [user, token]);


  // WebSocket setup for real-time activity log updates
  useEffect(() => {
    if (!user) return;
    
    const socketInstance = initializeSocket();

    if (!socketInstance.connected) socketInstance.connect();
    socketInstance.emit("join", user._id);

    const handleActivityUpdate = () => fetchLogs();
    
    socketInstance.on("activityUpdate", handleActivityUpdate);

    return () => {
      socketInstance.off("activityUpdate", handleActivityUpdate);
    };
  }, [user, fetchLogs]);

  // Filter logs based on the user's role
  const getAccessibleLogs = useCallback(() => {
    if (!user) return [];
    if (user.role === 'admin' || user.role === 'manager') {
        return logs;
    }

    // For regular users, filter logs to show only relevant ones
    return logs.filter(log => {
        // Show actions performed by the user
        if (log.performedBy?._id === user._id) return true;

        // Show actions on tasks assigned to the user
        if (log.entity === 'task' && userEntities.taskIds.includes(log.entityId)) return true;
        
        // Show actions on teams the user is a member of
        if (log.entity === 'team' && userEntities.teamIds.includes(log.entityId)) return true;
        
        // Show actions where the user is the entity (e.g., added to a team)
        if (log.entity === 'user' && log.entityId === user._id) return true;

        // A fallback for details strings that might mention the user by name
        if (log.details?.includes(user.name)) return true;

        return false;
    });
  }, [logs, user, userEntities]);

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