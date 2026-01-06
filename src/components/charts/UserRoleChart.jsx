"use client";
import { useState, useEffect } from 'react';
import { Typography, useTheme, Box, Skeleton, Paper } from '@mui/material';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import PieChart from './PieChart';
import { useNotifications } from '../../context/NotificationContext';

const UserRoleChart = () => {
    const { user, token } = useAuth();
    const { registerUpdateCallback, unregisterUpdateCallback } = useNotifications();
    const theme = useTheme();

    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [refetchTrigger, setRefetchTrigger] = useState(0);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        const callbackId = "user-role-chart";

        const handleDataUpdate = (entityType) => {
            if (entityType === "user") {
                setRefetchTrigger(prev => prev + 1);
            }
        };

        registerUpdateCallback(callbackId, handleDataUpdate);

        const fetchData = async () => {
            if (!token || !user) {
                setLoading(false);
                return;
            }
            if (isInitialLoad) setLoading(true);

            try {
                const res = await api.get('/users');
                const fetchedUsers = res.data || [];

                // Ensure current user is included
                const usersForCounting = fetchedUsers.some(u => u._id === user._id)
                    ? fetchedUsers
                    : [...fetchedUsers, user];

                const roleCounts = usersForCounting.reduce((acc, u) => {
                    acc[u.role] = (acc[u.role] || 0) + 1;
                    return acc;
                }, {});

                const dataForChart = [
                    { name: 'Admin', value: roleCounts.admin || 0, color: theme.palette.error.main },
                    { name: 'Manager', value: roleCounts.manager || 0, color: theme.palette.primary.main },
                    { name: 'User', value: roleCounts.user || 0, color: theme.palette.secondary.main }
                ];

                setChartData(dataForChart);
            } catch (err) {
                setError("Failed to fetch user data");
            } finally {
                setLoading(false);
                setIsInitialLoad(false);
            }
        };

        fetchData();

        return () => unregisterUpdateCallback(callbackId);
    }, [token, user, theme, refetchTrigger, registerUpdateCallback, unregisterUpdateCallback]);

    // --- Skeleton while loading ---
    if (loading && isInitialLoad) {
        return (
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 260 }}>
                {/* Title Skeleton */}
                <Skeleton variant="text" width="60%" height={28} sx={{ mb: 2 }} />

                {/* Pie skeleton */}
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Skeleton variant="circular" width={150} height={150} />
                </Box>

                {/* Legend skeleton */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                    {[1, 2, 3].map(i => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Skeleton variant="circular" width={12} height={12} />
                            <Skeleton variant="text" width={60} height={16} />
                        </Box>
                    ))}
                </Box>
            </Paper>
        );
    }

    if (error) return <Typography color="error">{error}</Typography>;

    return <PieChart data={chartData} title="Users by Role" />;
};

export default UserRoleChart;
