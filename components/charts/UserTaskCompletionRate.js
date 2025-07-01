"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '@mui/material';
import BarChart from './BarChart'; // This now passes the correct data format to BarChart
import axios from 'axios';
import { Skeleton, Box } from '@mui/material';

const UserTaskCompletionRate = () => {
  const { token } = useAuth();
  const theme = useTheme();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        return;
      };

      try {
        const [usersRes, tasksRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/tasks', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        const users = usersRes.data || [];
        const tasks = tasksRes.data.tasks || [];

        const userTaskStats = users.map(user => {
          const assignedTasks = tasks.filter(task => task.assignee?._id === user._id);
          const completedTasks = assignedTasks.filter(task => task.status === 'Done');
          const completionRate = assignedTasks.length > 0 ? Math.round((completedTasks.length / assignedTasks.length) * 100) : 0;
          return { name: user.name, value: completionRate };
        });

        // FIX: Create an array of objects, which is the format BarChart.js expects.
        const dataForChart = userTaskStats.map(stat => ({
          name: stat.name,
          value: stat.value,
          color: theme.palette.secondary.main,
        }));

        setChartData(dataForChart);
      } catch (err) {
        console.error("Failed to fetch user task completion data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, theme]);
    
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