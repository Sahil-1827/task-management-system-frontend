"use client";

import { useAuth } from '../../context/AuthContext';
import { Container, Grid, Typography, Box, CircularProgress } from '@mui/material';
import TaskStatusChart from '../../components/charts/TaskStatusChart';
import UserRoleChart from '../../components/charts/UserRoleChart';
import TeamTasksChart from '../../components/charts/TeamTasksChart';

const DashboardPage = () => {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const isAdmin = user.role === 'admin';
  const isManager = user.role === 'manager';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Welcome back, {user.name}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here's a snapshot of your workspace.
      </Typography>
      
      <Grid container spacing={3}>
        {/* Task Status Chart - Visible to Admins and Managers */}
        {(isAdmin || isManager) && (
          <Grid item xs={12} md={isAdmin ? 4 : 6}>
            <TaskStatusChart />
          </Grid>
        )}

        {/* Team Tasks Chart - Visible to Admins and Managers */}
        {(isAdmin || isManager) && (
          <Grid item xs={12} md={isAdmin ? 4 : 6}>
            <TeamTasksChart />
          </Grid>
        )}

        {/* User Roles Chart - Visible only to Admins */}
        {isAdmin && (
          <Grid item xs={12} md={4}>
            <UserRoleChart />
          </Grid>
        )}
        
        {/* Placeholder for regular users */}
        {!isAdmin && !isManager && (
            <Grid item xs={12}>
                <Typography variant="h6" color="text.secondary" align="center" sx={{p: 4}}>
                    Your personal dashboard is coming soon.
                </Typography>
            </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default DashboardPage;