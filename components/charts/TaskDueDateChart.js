"use client";
import { useState, useEffect } from 'react';
import { Typography, useTheme, Box, Skeleton } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import BarChart from './BarChart';
import { useNotifications } from '../../context/NotificationContext';

const TaskDueDateChart = () => {
    const { token } = useAuth();
    const { registerUpdateCallback, unregisterUpdateCallback } = useNotifications();
    const theme = useTheme();
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [refetchTrigger, setRefetchTrigger] = useState(0);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        const callbackId = "task-due-date-chart";
        const handleDataUpdate = (entityType) => {
            if (entityType === "task") {
                setRefetchTrigger((prev) => prev + 1);
            }
        };

        registerUpdateCallback(callbackId, handleDataUpdate);

        const fetchData = async () => {
            if (isInitialLoad) {
                setLoading(true);
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
            } finally {
                setLoading(false);
                setIsInitialLoad(false);
            }
        };
        fetchData();

        return () => {
            unregisterUpdateCallback(callbackId);
        };
    }, [token, theme, refetchTrigger, registerUpdateCallback, unregisterUpdateCallback]);
    
    if (loading && isInitialLoad) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Skeleton variant="rectangular" width="100%" height={200} />
            <Skeleton variant="text" width="60%" sx={{ mt: 2 }} />
        </Box>
    );
    if (error) return <Typography color="error">{error}</Typography>;

    return <BarChart data={chartData} title="Tasks by Due Date" />;
};

export default TaskDueDateChart;
