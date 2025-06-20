"use client"
import { createContext, useContext, useState, useCallback } from 'react';
import { activityLogService } from '../services/activityLogService';
import { useAuth } from './AuthContext';

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