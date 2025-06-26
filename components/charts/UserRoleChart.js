"use client";
import { useState, useEffect } from 'react';
import { CircularProgress, Typography, useTheme, Box } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import PieChart from './PieChart';

const UserRoleChart = () => {
    const { user, token } = useAuth();
    const theme = useTheme();
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!token || !user) {
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get('http://localhost:5000/api/users', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const fetchedUsers = res.data || [];

                const isCurrentUserInList = fetchedUsers.some(u => u._id === user._id);
                const usersForCounting = isCurrentUserInList ? fetchedUsers : [...fetchedUsers, user];

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
            }
        };
        fetchData();
    }, [token, user, theme]);

    if (loading) return <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}><CircularProgress /></Box>;
    if (error) return <Typography color="error">{error}</Typography>;

    return <PieChart data={chartData} title="Users by Role" />;
};

export default UserRoleChart;