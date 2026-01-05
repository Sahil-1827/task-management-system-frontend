"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect
} from "react";
import api from "../api";
import { activityLogService } from "../services/activityLogService";
import { useAuth } from "./AuthContext";

// NOTE: All socket logic has been removed from this file.
// It will now be handled directly in the ActivityLogList component.

const ActivityLogContext = createContext();

export const ActivityLogProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();

  const fetchLogs = useCallback(
    async (filters = {}) => {
      if (!token) {
        setLoading(false); // No token, so we are done loading.
        return;
      }
      try {
        const data = await activityLogService.getLogs(filters);
        setLogs(data);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        // Set loading to false after the fetch is complete (or has failed).
        setLoading(false);
      }
    },
    [token]
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