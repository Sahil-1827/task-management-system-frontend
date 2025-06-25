"use client";
import { useState, useEffect } from 'react';
import { Paper, Typography, Box, CircularProgress, useTheme } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const UserRoleChart = () => {
    const { token } = useAuth();
    const theme = useTheme();
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
             if (!token) return;
            try {
                const res = await axios.get('http://localhost:5000/api/users', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const roleCounts = res.data.reduce((acc, user) => {
                    acc[user.role] = (acc[user.role] || 0) + 1;
                    return acc;
                }, {});
                setData(roleCounts);
            } catch (err) {
                 setError("Failed to fetch user data");
            }
        };
        fetchData();
    }, [token]);
    
    const colors = {
        admin: theme.palette.error.main,
        manager: theme.palette.primary.main,
        user: theme.palette.secondary.main
    };

    return (
        <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Users by Role</Typography>
            {data ? (
                <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: 150, mt: 4 }}>
                   {Object.entries(data).map(([role, count]) => (
                       <Box key={role} sx={{ textAlign: 'center' }}>
                           <Typography variant="h6">{count}</Typography>
                           <Box sx={{ height: count * 20, width: 50, bgcolor: colors[role] || 'grey.500', borderRadius: '4px 4px 0 0' }} />
                           <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{role}</Typography>
                       </Box>
                   ))}
                </Box>
            ) : error ? <Typography color="error">{error}</Typography> : <CircularProgress />}
        </Paper>
    );
};

export default UserRoleChart;