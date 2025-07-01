"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '@mui/material';
import PieChart from './PieChart';
import axios from 'axios';

const TeamTaskDistribution = () => {
  const { token } = useAuth();
  const theme = useTheme();
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const [tasksRes, teamsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/tasks', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/teams', { headers: { Authorization: `Bearer ${token}` } })
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
      }
    };
    fetchData();
  }, [token, theme]);
    
  if (!chartData) return null;

  return <PieChart data={chartData} title="Team Task Distribution" />;
};

export default TeamTaskDistribution;