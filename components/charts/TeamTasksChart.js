"use client";
import { useState, useEffect } from 'react';
import { Paper, Typography, Box, Grid, CircularProgress, Card, CardContent, Skeleton } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const TeamTasksChart = () => {
    const { token } = useAuth();
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            try {
                const [tasksRes, teamsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/tasks', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:5000/api/teams', { headers: { Authorization: `Bearer ${token}` } })
                ]);

                const tasks = tasksRes.data.tasks || tasksRes.data;
                const teams = teamsRes.data.teams || teamsRes.data;

                const teamTaskCounts = teams.map(team => {
                    const count = tasks.filter(task => task.team?._id === team._id).length;
                    // FIX: Pass the unique team._id to be used as a key
                    return { id: team._id, name: team.name, count };
                });
                
                setData(teamTaskCounts);
            } catch (err) {
                setError("Failed to fetch team task data");
            }
        };
        fetchData();
    }, [token]);

    if (error) return <Paper sx={{p:3, height: '100%'}}><Typography color="error">{error}</Typography></Paper>;
    if (!data) return (
        <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Skeleton variant="text" width="80%" height={30} />
                <Grid container spacing={2}>
                    {[...Array(3)].map((_, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <Skeleton variant="rectangular" height={100} />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Paper>
    );

    return (
        <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Tasks per Team</Typography>
            <Grid container spacing={2} sx={{mt: 1}}>
                {data.length > 0 ? data.map(team => (
                    // FIX: Use the unique team.id as the key instead of team.name
                    <Grid item xs={12} sm={6} key={team.id}>
                        <Card variant="outlined">
                             <CardContent>
                                 <Typography variant="body1" fontWeight="bold">{team.name}</Typography>
                                 <Typography variant="h4" color="primary">{team.count}</Typography>
                                 <Typography variant="body2" color="text.secondary">
                                   Active Task{team.count === 1 ? '' : 's'}
                                 </Typography>
                             </CardContent>
                        </Card>
                    </Grid>
                )) : (
                    <Grid item xs={12}>
                        <Typography color="text.secondary">No teams with assigned tasks found.</Typography>
                    </Grid>
                )}
            </Grid>
        </Paper>
    );
};

export default TeamTasksChart;