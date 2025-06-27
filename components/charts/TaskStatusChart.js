"use client";
import { useState, useEffect } from 'react';
import { CircularProgress, Typography, useTheme, Box, Skeleton } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import PieChart from './PieChart';

const TaskStatusChart = () => {
    const { token } = useAuth();
    const theme = useTheme();
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!token) {
                setLoading(false);
                return;
            };
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
                setError("Failed to fetch task data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token, theme]);
    
    if (loading) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Skeleton variant="circular" width={100} height={100} />
            <Skeleton variant="text" width="60%" sx={{ mt: 2 }} />
        </Box>
    );
    if (error) return <Typography color="error">{error}</Typography>;

    return <PieChart data={chartData} title="All Tasks by Status" />;
};

export default TaskStatusChart;