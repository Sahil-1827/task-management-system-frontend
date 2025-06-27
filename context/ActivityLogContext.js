"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect
} from "react";
import axios from "axios";
import { activityLogService } from "../services/activityLogService";
import { useAuth } from "./AuthContext";

// NOTE: All socket logic has been removed from this file.
// It will now be handled directly in the ActivityLogList component.

const ActivityLogContext = createContext();

export const ActivityLogProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();

  const fetchLogs = useCallback(
    async (filters = {}) => {
      if (!token) return;
      try {
        // We don't set loading to true if logs already exist, to prevent UI flicker on real-time updates
        if (logs.length === 0) {
          setLoading(true);
        }
        const data = await activityLogService.getLogs(filters);
        setLogs(data);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    },
    [logs.length, token]
  );

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user, fetchLogs]);


  return (
    <ActivityLogContext.Provider
      value={{
        logs,
        loading,
        fetchLogs,
      }}
    >
      {children}
    </ActivityLogContext.Provider>
  );
};

export const useActivityLog = () => useContext(ActivityLogContext);