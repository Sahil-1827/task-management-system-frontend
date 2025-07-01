"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '@mui/material';
import BarChart from './BarChart';
import axios from 'axios';
import { Skeleton, Box } from '@mui/material';
import { useNotifications } from '../../context/NotificationContext';

const UserTaskCompletionRate = () => {
  const { token } = useAuth();
  const { registerUpdateCallback, unregisterUpdateCallback } = useNotifications();
  const theme = useTheme();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const callbackId = "user-task-completion-rate-chart";
    const handleDataUpdate = (entityType) => {
      if (entityType === "task" || entityType === "user" || entityType === "team") {
        setRefetchTrigger((prev) => prev + 1);
      }
    };

    registerUpdateCallback(callbackId, handleDataUpdate);

    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        return;
      };

      try {
        // Step 1: Fetch users, tasks, AND teams
        const [usersRes, tasksRes, teamsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/tasks', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/teams', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        const users = usersRes.data || [];
        const tasks = tasksRes.data.tasks || [];
        const teams = teamsRes.data.teams || [];

        const userTaskStats = users.map(user => {
          // Step 2: Find all teams the user is a member of
          const userTeamIds = teams
            .filter(team => team.members.some(member => member._id === user._id))
            .map(team => team._id);

          // Step 3: Filter for tasks assigned to the user OR their teams
          const assignedTasks = tasks.filter(task => 
            (task.assignee?._id === user._id) || 
            (task.team?._id && userTeamIds.includes(task.team._id))
          );

          const completedTasks = assignedTasks.filter(task => task.status === 'Done');
          const completionRate = assignedTasks.length > 0 ? Math.round((completedTasks.length / assignedTasks.length) * 100) : 0;
          return { name: user.name, value: completionRate };
        });

        const dataForChart = userTaskStats.map(stat => ({
          name: stat.name,
          value: stat.value,
          color: theme.palette.success.main, // Changed color for better representation
        }));

        setChartData(dataForChart);
      } catch (err) {
        console.error("Failed to fetch user task completion data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    return () => {
      unregisterUpdateCallback(callbackId);
    };
  }, [token, theme, refetchTrigger, registerUpdateCallback, unregisterUpdateCallback]);
    
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Skeleton variant="rectangular" width="100%" height={200} />
          <Skeleton variant="text" width="60%" sx={{ mt: 2 }} />
      </Box>
    );
  }

  return <BarChart data={chartData} title="User Task Completion Rate" />;
};

export default UserTaskCompletionRate;