import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Container, Grid, Typography, Box, CircularProgress } from '@mui/material';
import TaskStatusChart from '../components/charts/TaskStatusChart';
import UserRoleChart from '../components/charts/UserRoleChart';
import TeamTasksChart from '../components/charts/TeamTasksChart';
import MyTasksStatusChart from '../components/charts/MyTasksStatusChart';
import TaskPriorityChart from '../components/charts/TaskPriorityChart';
import TaskDueDateChart from '../components/charts/TaskDueDateChart';
import StatCard from '../components/dashboard/StatCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import MyTasks from '../components/dashboard/MyTasks';
import PeopleIcon from '@mui/icons-material/People';
import TaskIcon from '@mui/icons-material/Task';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import TeamTaskDistribution from '../components/charts/TeamTaskDistribution';
import UserTaskCompletionRate from '../components/charts/UserTaskCompletionRate';
import api from '../api';
import { useNotifications } from '../context/NotificationContext';

const DashboardPage = () => {
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const { user, token, loading } = useAuth();
  const { registerUpdateCallback, unregisterUpdateCallback } = useNotifications();
  const [stats, setStats] = useState({ users: 0, tasks: 0, teams: 0, completedTasks: 0, pendingTasks: 0, highPriorityTasks: 0, teamsWithTasks: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const callbackId = "dashboard-page";
    const handleDataUpdate = (entityType) => {
      if (entityType === "task" || entityType === "team") {
        setRefetchTrigger((prev) => prev + 1);
      }
    };

    registerUpdateCallback(callbackId, handleDataUpdate);

    return () => {
      unregisterUpdateCallback(callbackId);
    };
  }, [registerUpdateCallback, unregisterUpdateCallback]);

  useEffect(() => {
    if (!token || !user) {
      setStatsLoading(false);
      return;
    }
    if (user.role === 'user') {
      setStatsLoading(false);
      return;
    }

    const fetchStats = async () => {
      if (isInitialLoad) {
        setStatsLoading(true);
      }
      try {
        const [usersRes, tasksRes, teamsRes] = await Promise.all([
          api.get('/users'),
          api.get('/tasks'),
          api.get('/teams'),
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
        setIsInitialLoad(false);
      }
    };

    fetchStats();
  }, [token, user, refetchTrigger, isInitialLoad]);

  // if (loading || statsLoading) {
  //   return (
  //     <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
  //       <CircularProgress />
  //     </Box>
  //   );
  // }

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
      <Typography variant="h4" sx={{ mb: 1, color: 'primary.main' }}>
        Welcome back, {user.name}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here's a snapshot of your workspace.
      </Typography>

      {(isAdmin || isManager) && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item sx={{ minWidth: "150px" }}>
            <StatCard
              title="Total Tasks"
              value={stats?.tasks}
              icon={<TaskIcon />}
              color="primary.main"
              loading={statsLoading}
            />
          </Grid>

          <Grid item sx={{ minWidth: "150px" }}>
            <StatCard
              title="Total Users"
              value={stats?.users}
              icon={<PeopleIcon />}
              color="secondary.main"
              loading={statsLoading}
            />
          </Grid>

          <Grid item sx={{ minWidth: "150px" }}>
            <StatCard
              title="Total Teams"
              value={stats?.teams}
              icon={<GroupWorkIcon />}
              color="info.main"
              loading={statsLoading}
            />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        {(isAdmin || isManager) && (
          <>
            <Grid item sx={{ minWidth: "150px" }}>
              <TeamTaskDistribution />
            </Grid>
            <Grid item sx={{ minWidth: "150px" }}>
              <UserTaskCompletionRate />
            </Grid>
          </>
        )}

        {(isManager || user.role === 'user') && (
          <Grid item sx={{ minWidth: "150px" }}>
            <MyTasks />
          </Grid>
        )}

        <Grid item sx={{ minWidth: "150px" }}>
          <TaskStatusChart />
        </Grid>
        <Grid item sx={{ minWidth: "150px" }}>
          <TaskPriorityChart />
        </Grid>
        <Grid item sx={{ minWidth: "150px" }}>
          <TaskDueDateChart />
        </Grid>

        {isAdmin && (
          <Grid item sx={{ minWidth: "150px" }}>
            <UserRoleChart />
          </Grid>
        )}

        {(isAdmin || isManager) && (
          <Grid item sx={{ minWidth: "150px" }}>
            <RecentActivity />
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default DashboardPage;
