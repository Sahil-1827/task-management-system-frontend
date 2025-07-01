"use client";
import { useState, useEffect } from 'react';
import { Typography, useTheme, Box, Skeleton } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import BarChart from './BarChart';

const TaskDueDateChart = () => {
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

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const counts = {
                    'Overdue': 0,
                    'Today': 0,
                    'This Week': 0,
                    'Later': 0,
                };

                tasks.forEach(task => {
                    if (!task.dueDate) return;

                    const dueDate = new Date(task.dueDate);
                    dueDate.setHours(0, 0, 0, 0);

                    if (dueDate < today) {
                        counts['Overdue']++;
                    } else if (dueDate.getTime() === today.getTime()) {
                        counts['Today']++;
                    } else if (dueDate > today && dueDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
                        counts['This Week']++;
                    } else {
                        counts['Later']++;
                    }
                });
                
                const dataForChart = [
                    { name: 'Overdue', value: counts['Overdue'] || 0, color: theme.palette.error.main },
                    { name: 'Today', value: counts['Today'] || 0, color: theme.palette.warning.main },
                    { name: 'This Week', value: counts['This Week'] || 0, color: theme.palette.info.main },
                    { name: 'Later', value: counts['Later'] || 0, color: theme.palette.success.main },
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

    return <BarChart data={chartData} title="Tasks by Due Date" />;
};

export default TaskDueDateChart;
