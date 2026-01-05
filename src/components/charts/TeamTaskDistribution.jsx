"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '@mui/material';
import PieChart from './PieChart';
import api from '../../api';
import { useNotifications } from '../../context/NotificationContext';

const TeamTaskDistribution = () => {
  const { token } = useAuth();
  const { registerUpdateCallback, unregisterUpdateCallback } = useNotifications();
  const theme = useTheme();
  const [chartData, setChartData] = useState(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const callbackId = "team-task-distribution-chart";
    const handleDataUpdate = (entityType) => {
      if (entityType === "task" || entityType === "team") {
        setRefetchTrigger((prev) => prev + 1);
      }
    };

    registerUpdateCallback(callbackId, handleDataUpdate);

    const fetchData = async () => {
      if (!token) return;
      try {
        const [tasksRes, teamsRes] = await Promise.all([
          api.get('/tasks'),
          api.get('/teams')
        ]);

        const tasks = tasksRes.data.tasks || [];
        const teams = teamsRes.data.teams || [];

        const teamTaskCounts = teams.map(team => {
          const taskCount = tasks.filter(task => task.team && task.team._id === team._id).length;
          return { id: team._id, name: team.name, value: taskCount }; // Add the 'id'
        });

        // Assign colors dynamically
        const colors = [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.info.main,
          theme.palette.success.main,
          theme.palette.warning.main,
          theme.palette.error.main,
        ];
        
        const dataForChart = teamTaskCounts.map((team, index) => ({
          ...team,
          color: colors[index % colors.length]
        }));

        setChartData(dataForChart);
      } catch (err) {
        console.error("Failed to fetch team task data", err);
      } finally {
        setIsInitialLoad(false);
      }
    };
    fetchData();

    return () => {
      unregisterUpdateCallback(callbackId);
    };
  }, [token, theme, refetchTrigger, registerUpdateCallback, unregisterUpdateCallback]);
    
  if (!chartData && isInitialLoad) return null;

  return <PieChart data={chartData} title="Team Task Distribution" />;
};

export default TeamTaskDistribution;