"use client";

import { useAuth } from '../../context/AuthContext';
import { Container, Grid, Typography, Box, CircularProgress } from '@mui/material';
import TaskStatusChart from '../../components/charts/TaskStatusChart';
import UserRoleChart from '../../components/charts/UserRoleChart';
import TeamTasksChart from '../../components/charts/TeamTasksChart';
import MyTasksStatusChart from '../../components/charts/MyTasksStatusChart';


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
  const isRegularUser = user.role === 'user';

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Welcome back, {user.name}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here&apos;s a snapshot of your workspace.
      </Typography>
      
      <Grid container spacing={3}>
        {/* Admin and Manager View */}
        {(isAdmin || isManager) && (
          <>
            <Grid item xs={12} md={isAdmin ? 4 : 6} sx={{ display: 'flex' }}>
              <TaskStatusChart />
            </Grid>
            <Grid item xs={12} md={isAdmin ? 4 : 6} sx={{ display: 'flex' }}>
              <TeamTasksChart />
            </Grid>
          </>
        )}

        {/* Admin-Only View */}
        {isAdmin && (
          <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
            <UserRoleChart />
          </Grid>
        )}
        
        {/* Regular User View */}
        {isRegularUser && (
            <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
                <MyTasksStatusChart />
            </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default DashboardPage;