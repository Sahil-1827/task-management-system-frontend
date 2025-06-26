"use client";
import { useState, useEffect } from 'react';
import { Paper, Typography, Box, Grid, CircularProgress, Card, CardContent } from '@mui/material';
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
                    axios.get('http://localhost:8080/api/tasks', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:8080/api/teams', { headers: { Authorization: `Bearer ${token}` } })
                ]);

                const tasks = tasksRes.data.tasks || tasksRes.data;
                const teams = teamsRes.data.teams || teamsRes.data;

                const teamTaskCounts = teams.map(team => {
                    const count = tasks.filter(task => task.team?._id === team._id).length;
                    return { name: team.name, count };
                });
                
                setData(teamTaskCounts);
            } catch (err) {
                setError("Failed to fetch team task data");
            }
        };
        fetchData();
    }, [token]);

    if (error) return <Paper sx={{p:3, height: '100%'}}><Typography color="error">{error}</Typography></Paper>;
    if (!data) return <Paper sx={{p:3, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}><CircularProgress /></Paper>;

    return (
        <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Tasks per Team</Typography>
            <Grid container spacing={2} sx={{mt: 1}}>
                {data.length > 0 ? data.map(team => (
                    <Grid item xs={12} sm={6} key={team.name}>
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