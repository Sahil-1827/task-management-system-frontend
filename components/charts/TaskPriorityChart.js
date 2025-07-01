import { useState, useEffect } from 'react';
import { Typography, useTheme, Box, Skeleton } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import BarChart from './BarChart';
import { useNotifications } from '../../context/NotificationContext';

const TaskPriorityChart = () => {
    const { token } = useAuth();
    const { registerUpdateCallback, unregisterUpdateCallback } = useNotifications();
    const theme = useTheme();
    
    // Initialize state to null. We will conditionally render based on this.
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    useEffect(() => {
        const callbackId = "task-priority-chart";
        const handleDataUpdate = (entityType) => {
            if (entityType === "task") {
                setRefetchTrigger((prev) => prev + 1);
            }
        };

        registerUpdateCallback(callbackId, handleDataUpdate);

        const fetchData = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            
            setLoading(true);
            setError("");

            try {
                const res = await axios.get('http://localhost:5000/api/tasks/stats/priority', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const priorityCounts = res.data;
                
                // This is the data structure your BarChart will receive
                const dataForChart = [
                    { name: 'Low', value: priorityCounts.low || 0, color: theme.palette.info.main },
                    { name: 'Medium', value: priorityCounts.medium || 0, color: theme.palette.warning.main },
                    { name: 'High', value: priorityCounts.high || 0, color: theme.palette.error.main }
                ];
                
                setChartData(dataForChart);

            } catch (err) {
                setError("Failed to fetch task data.");
                console.error("TaskPriorityChart: Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();

        return () => {
            unregisterUpdateCallback(callbackId);
        };
    }, [token, theme, refetchTrigger, registerUpdateCallback, unregisterUpdateCallback]);

    // --- Conditional Rendering Logic ---

    // 1. Show an error message if the API call fails
    if (error) {
        return <Typography sx={{ p: 2 }} color="error">{error}</Typography>;
    }

    // 2. Show a loading skeleton while fetching OR if chartData is not yet available.
    //    This is the key part of the fix. It prevents the BarChart from ever
    //    receiving a 'null' or 'undefined' data prop.
    if (loading || !chartData) {
        return (
            <Box sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Skeleton variant="rectangular" width="90%" height={150} />
            </Box>
        );
    }
    
    // 3. Only when loading is complete AND chartData is a valid array, render the chart.
    return <BarChart data={chartData} title="All Tasks by Priority" />;
};

export default TaskPriorityChart;