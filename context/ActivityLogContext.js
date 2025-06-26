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

  // This part is for filtering logs for non-admins, it should stay.
  useEffect(() => {
    if (!user || !token || user.role === "admin" || user.role === "manager") {
      setUserEntities({ taskIds: [], teamIds: [] });
      return;
    }
    const fetchUserEntities = async () => {
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
        const myTaskIds = allTasks
          .filter((task) => task.assignee?._id === user._id)
          .map((task) => task._id);

        const allTeams = teamsRes.data.teams || teamsRes.data;
        const myTeamIds = allTeams
          .filter((team) =>
            team.members.some((member) => member._id === user._id)
          )
          .map((team) => team._id);
        setUserEntities({ taskIds: myTaskIds, teamIds: myTeamIds });
      } catch (error) {
        console.error("Error fetching user entities for activity log:", error);
      }
    };
    fetchUserEntities();
  }, [user, token]);

  const getAccessibleLogs = useCallback(() => {
    if (!user) return [];
    if (user.role === "admin" || user.role === "manager") {
      return logs;
    }

    return logs.filter((log) => {
      if (log.performedBy?._id === user._id) return true;
      if (log.entity === "task" && userEntities.taskIds.includes(log.entityId))
        return true;
      if (log.entity === "team" && userEntities.teamIds.includes(log.entityId))
        return true;
      if (log.entity === "user" && log.entityId === user._id) return true;
      if (log.details?.includes(user.name)) return true;
      return false;
    });
  }, [logs, user, userEntities]);

  return (
    <ActivityLogContext.Provider
      value={{
        logs: getAccessibleLogs(),
        loading,
        fetchLogs
      }}
    >
      {children}
    </ActivityLogContext.Provider>
  );
};

export const useActivityLog = () => useContext(ActivityLogContext);
