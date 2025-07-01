"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Container, Grid, Typography, Box, CircularProgress } from '@mui/material';
import TaskStatusChart from '../../components/charts/TaskStatusChart';
import UserRoleChart from '../../components/charts/UserRoleChart';
import TeamTasksChart from '../../components/charts/TeamTasksChart';
import MyTasksStatusChart from '../../components/charts/MyTasksStatusChart';
import TaskPriorityChart from '../../components/charts/TaskPriorityChart';
import TaskDueDateChart from '../../components/charts/TaskDueDateChart';
import StatCard from '../../components/dashboard/StatCard';
import RecentActivity from '../../components/dashboard/RecentActivity';
import MyTasks from '../../components/dashboard/MyTasks';
import PeopleIcon from '@mui/icons-material/People';
import TaskIcon from '@mui/icons-material/Task';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import axios from 'axios';

const DashboardPage = () => {
  const { user, token, loading } = useAuth();
  const [stats, setStats] = useState({ users: 0, tasks: 0, teams: 0, completedTasks: 0, pendingTasks: 0, highPriorityTasks: 0, teamsWithTasks: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) return;
    if (user.role === 'user') {
      setStatsLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const [usersRes, tasksRes, teamsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/tasks', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/teams', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const allTasks = tasksRes.data?.tasks || [];
        const allTeams = teamsRes.data?.teams || [];
        const completedTasks = allTasks.filter(task => task.status === 'Done').length;
        const pendingTasks = allTasks.filter(task => task.status === 'To Do' || task.status === 'In Progress').length;
        const highPriorityTasks = allTasks.filter(task => task.priority === 'High').length;
        const teamsWithTasks = new Set(allTasks.filter(task => task.team).map(task => task.team._id)).size;

        setStats({
          users: usersRes.data?.length || 0,
          tasks: tasksRes.data?.totalTasks || 0,
          teams: allTeams.length || 0,
          completedTasks,
          pendingTasks,
          highPriorityTasks,
          teamsWithTasks,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [token, user]);

  if (loading || statsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6">Please log in to view the dashboard.</Typography>
      </Box>
    );
  }

  const isAdmin = user.role === 'admin';
  const isManager = user.role === 'manager';

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        Welcome back, {user.name}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here&apos;s a snapshot of your workspace.
      </Typography>

      {/* Admin and Manager Stats */}
      {(isAdmin || isManager) && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard title="Total Tasks" value={stats.tasks} icon={<TaskIcon />} color="primary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard title="Total Users" value={stats.users} icon={<PeopleIcon />} color="secondary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard title="Total Teams" value={stats.teams} icon={<GroupWorkIcon />} color="info" />
          </Grid>
        </Grid>
      )}

      {/* Task Overview for Admin/Manager */}
      {(isAdmin || isManager) && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard title="Completed Tasks" value={stats.completedTasks} icon={<TaskIcon />} color="success" />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard title="Pending Tasks" value={stats.pendingTasks} icon={<TaskIcon />} color="warning" />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard title="High Priority Tasks" value={stats.highPriorityTasks} icon={<TaskIcon />} color="error" />
          </Grid>
        </Grid>
      )}

      {/* Team Performance for Admin/Manager */}
      {(isAdmin || isManager) && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard title="Teams with Tasks" value={stats.teamsWithTasks} icon={<GroupWorkIcon />} color="info" />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        {/* All Roles */}
        {(isManager || user.role === 'user') && (
          <Grid size={{ xs: 12, md: 8 }}>
            <MyTasks />
          </Grid>
        )}
        {(isManager || user.role === 'user') && (
        <Grid size={{ xs: 12, md: 4 }}>
          <MyTasksStatusChart />
        </Grid>
        )}

        {/* Admin and Manager View */}
        {(isAdmin || isManager) && (
          <>
            
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} sx={{ display: 'flex' }}>
              <TaskStatusChart />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} sx={{ display: 'flex' }}>
              <TaskPriorityChart />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} sx={{ display: 'flex' }}>
              <TaskDueDateChart />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: isAdmin ? 4 : 8 }} sx={{ display: 'flex' }}>
              <TeamTasksChart />
            </Grid>
          </>
        )}

        {/* Admin-Only View */}
        {isAdmin && (
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
            <UserRoleChart />
          </Grid>
        )}

         {(isAdmin || isManager) && (
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
            <RecentActivity />
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default DashboardPage;