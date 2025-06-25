"use client";
import { useState, useEffect } from 'react';
import { CircularProgress, Typography, useTheme } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import PieChart from './PieChart';

const MyTasksStatusChart = () => {
    const { user, token } = useAuth();
    const theme = useTheme();
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            if (!token || !user) return;
            try {
                const res = await axios.get('http://localhost:5000/api/tasks', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const allTasks = res.data.tasks || res.data;
                
                const myTasks = allTasks.filter(task => task.assignee?._id === user._id);

                const statusCounts = myTasks.reduce((acc, task) => {
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
                setError("Failed to fetch your task data");
            }
        };
        fetchData();
    }, [token, user, theme]);
    
    if (error) return <Typography color="error">{error}</Typography>;
    if (!chartData) return <CircularProgress />;

    return <PieChart data={chartData} title="My Assigned Tasks" />;
};

export default MyTasksStatusChart;