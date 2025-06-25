"use client";
import { useState, useEffect } from 'react';
import { Paper, Typography, Box, LinearProgress, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const TaskStatusChart = () => {
    const { token } = useAuth();
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

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
                const totalTasks = tasks.length;
                setData({ ...statusCounts, totalTasks });
            } catch (err) {
                setError("Failed to fetch task data");
            }
        };
        fetchData();
    }, [token]);

    const chartData = [
        { status: 'To Do', color: 'info.main' },
        { status: 'In Progress', color: 'warning.main' },
        { status: 'Done', color: 'success.main' }
    ];

    return (
        <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Tasks by Status</Typography>
            {data ? (
                <Box>
                    {chartData.map(item => {
                        const count = data[item.status] || 0;
                        const percentage = data.totalTasks > 0 ? (count / data.totalTasks) * 100 : 0;
                        return (
                            <Box key={item.status} sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2">{item.status}</Typography>
                                    <Typography variant="body2">{count}</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={percentage} sx={{ height: 8, borderRadius: 2, '& .MuiLinearProgress-bar': { backgroundColor: item.color } }} />
                            </Box>
                        )
                    })}
                </Box>
            ) : error ? <Typography color="error">{error}</Typography> : <CircularProgress />}
        </Paper>
    );
};

export default TaskStatusChart;