"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '@mui/material';
import PieChart from './PieChart';
import axios from 'axios';

const TaskStatusChart = () => {
  const { token } = useAuth();
  const theme = useTheme();
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const res = await axios.get('http://localhost:5000/api/tasks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const tasks = res.data.tasks || res.data;
        const statusCounts = tasks.reduce((acc, task) => {
          acc[task.status] = (acc[task.status] || 0) + 1;
          return acc;
        }, {});
        
        const dataForChart = [
          { name: 'To Do', value: statusCounts['To Do'] || 0, color: theme.palette.info.main },
          { name: 'In Progress', value: statusCounts['In Progress'] || 0, color: theme.palette.warning.main },
          { name: 'Done', value: statusCounts['Done'] || 0, color: theme.palette.success.main }
        ];
        setChartData(dataForChart);
      } catch (err) {
        console.error("Failed to fetch task data", err);
      }
    };
    fetchData();
  }, [token, theme]);
    
  if (!chartData) return null;

  return <PieChart data={chartData} title="All Tasks by Status" />;
};

export default TaskStatusChart;