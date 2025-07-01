"use client";
import { useState, useEffect } from 'react';
import { Typography, useTheme, Box, Skeleton } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import BarChart from './BarChart';

const TaskPriorityChart = () => {
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
                const priorityCounts = tasks.reduce((acc, task) => {
                    acc[task.priority] = (acc[task.priority] || 0) + 1;
                    return acc;
                }, {});
                
                const dataForChart = [
                    { name: 'Low', value: priorityCounts['Low'] || 0, color: theme.palette.info.main },
                    { name: 'Medium', value: priorityCounts['Medium'] || 0, color: theme.palette.warning.main },
                    { name: 'High', value: priorityCounts['High'] || 0, color: theme.palette.error.main }
                ];
                setChartData(dataForChart);
            } catch (err) {
                setError("Failed to fetch task data");
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token, theme]);
    
    if (loading) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Skeleton variant="rectangular" width="100%" height={200} />
            <Skeleton variant="text" width="60%" sx={{ mt: 2 }} />
        </Box>
    );
    if (error) return <Typography color="error">{error}</Typography>;

    return <BarChart data={chartData} title="All Tasks by Priority" />;
};

export default TaskPriorityChart;
