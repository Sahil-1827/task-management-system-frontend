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
  const [userEntities, setUserEntities] = useState({
    taskIds: [],
    teamIds: []
  });

  const fetchLogs = useCallback(
    async (filters = {}) => {
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
    [logs.length]
  );

  const fetchUserEntities = useCallback(async () => {
    if (!user || !token || user.role === "admin" || user.role === "manager") {
      setUserEntities({ taskIds: [], teamIds: [] });
      return;
    }
    try {
      const [tasksRes, teamsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/tasks", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:5000/api/teams", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const allTasks = tasksRes.data.tasks || tasksRes.data;
      const allTeams = teamsRes.data.teams || teamsRes.data;

      const myTeamIds = allTeams
        .filter((team) =>
          team.members.some((member) => member._id === user._id)
        )
        .map((team) => team._id);

      const myTaskIds = allTasks
        .filter(
          (task) =>
            task.assignee?._id === user._id ||
            (task.team && myTeamIds.includes(task.team._id || task.team))
        )
        .map((task) => task._id);

      setUserEntities({ taskIds: myTaskIds, teamIds: myTeamIds });
    } catch (error) {
      console.error("Error fetching user entities for activity log:", error);
    }
  }, [user, token]);

  useEffect(() => {
    if (user) {
      fetchUserEntities();
    }
  }, [user, fetchUserEntities]);

  const getAccessibleLogs = useCallback(() => {
    if (!user) return [];
    if (user.role === "admin" || user.role === "manager") {
      return logs;
    }

    return logs.filter((log) => {
      if (log.performedBy?._id === user._id) return true;
      if (log.entityId === user._id) return true; // Direct action on the user

      // Check if the log is related to a task assigned to the user or their team
      if (log.entity === "task" && userEntities.taskIds.includes(log.entityId)) {
        return true;
      }

      // Check if the log is related to a team the user is a member of
      if (log.entity === "team" && userEntities.teamIds.includes(log.entityId)) {
        return true;
      }

      // Fallback for logs that mention the user by name or ID in details
      if (log.details?.includes(user.name)) return true;
      if (log.details?.includes(user._id)) return true;

      return false;
    });
  }, [logs, user, userEntities]);

  return (
    <ActivityLogContext.Provider
      value={{
        logs: getAccessibleLogs(),
        loading,
        fetchLogs,
        refreshUserEntities: fetchUserEntities
      }}
    >
      {children}
    </ActivityLogContext.Provider>
  );
};

export const useActivityLog = () => useContext(ActivityLogContext);
