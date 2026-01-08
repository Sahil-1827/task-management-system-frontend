import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Grid, Typography, Box, Alert, Button, Fade, useTheme } from '@mui/material';
// Icons
import PeopleIcon from '@mui/icons-material/People';
import TaskIcon from '@mui/icons-material/Task';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Charts & Widgets
import TaskStatusChart from '../components/charts/TaskStatusChart';
import UserRoleChart from '../components/charts/UserRoleChart';
import TeamTasksChart from '../components/charts/TeamTasksChart';
import TaskPriorityChart from '../components/charts/TaskPriorityChart';
import TaskDueDateChart from '../components/charts/TaskDueDateChart';
import StatCard from '../components/dashboard/StatCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import MyTasks from '../components/dashboard/MyTasks';
import TeamTaskDistribution from '../components/charts/TeamTaskDistribution';
import UserTaskCompletionRate from '../components/charts/UserTaskCompletionRate';
import api from '../api';
import { useNotifications } from '../context/NotificationContext';
import { useTimeGreeting } from '../hooks/useTimeGreeting';

const DashboardPage = () => {
  const greeting = useTimeGreeting();
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();
  const { registerUpdateCallback, unregisterUpdateCallback } = useNotifications();
  const theme = useTheme();

  const [stats, setStats] = useState({
    users: 0,
    tasks: 0,
    teams: 0,
    completedTasks: 0,
    pendingTasks: 0,
    highPriorityTasks: 0,
    teamsWithTasks: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // ... (Keep existing useEffects for data fetching same as before)
  useEffect(() => {
    const callbackId = "dashboard-page";
    const handleDataUpdate = (entityType) => {
      if (entityType === "task" || entityType === "team") {
        setRefetchTrigger((prev) => prev + 1);
      }
    };
    registerUpdateCallback(callbackId, handleDataUpdate);
    return () => unregisterUpdateCallback(callbackId);
  }, [registerUpdateCallback, unregisterUpdateCallback]);

  useEffect(() => {
    if (!loading && !user) navigate("/");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!token || !user) {
      setStatsLoading(false);
      return;
    }

    const fetchStats = async () => {
      if (isInitialLoad) setStatsLoading(true);
      try {
        const promises = [
          api.get('/tasks'),
          api.get('/teams'),
        ];
        if (user.role === 'admin' || user.role === 'manager') {
          promises.push(api.get('/users'));
        }

        const results = await Promise.allSettled(promises);
        const tasksRes = results[0].status === 'fulfilled' ? results[0].value : { data: { tasks: [], totalTasks: 0 } };
        const teamsRes = results[1].status === 'fulfilled' ? results[1].value : { data: { teams: [] } };
        const usersRes = results[2]?.status === 'fulfilled' ? results[2].value : { data: [] };

        const allTasks = tasksRes.data?.tasks || [];
        const allTeams = teamsRes.data?.teams || [];
        const allUsers = Array.isArray(usersRes.data) ? usersRes.data : [];

        const completedTasks = allTasks.filter(task => task.status === 'Done').length;
        const pendingTasks = allTasks.filter(task => task.status === 'To Do' || task.status === 'In Progress').length;
        const highPriorityTasks = allTasks.filter(task => task.priority === 'High').length;
        const teamsWithTasks = new Set(allTasks.filter(task => task.team).map(task => task.team._id)).size;

        setStats({
          users: allUsers.length || 0,
          tasks: tasksRes.data?.totalTasks || allTasks.length || 0,
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

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const isManager = user.role === 'manager';

  // Standard height for chart rows to align perfectly
  const CHART_HEIGHT = 380;

  return (
    <Fade in={true}>
      <Container maxWidth="2xl" sx={{ py: 3 }}>
        {/* Welcome Banner */}
        <Box
          sx={{
            mb: 4,
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            backgroundImage: theme => theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.background.paper} 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
            color: 'white',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            bgcolor: 'white',
            opacity: 0.1
          }} />

          <Box sx={{ position: 'relative', zIndex: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ m: 0 }}>
              {greeting}, {user.name.split(' ')[0]}! 👋
            </Typography>
            {user.role === 'user' && (
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, fontSize: '1rem' }}>
                You have {stats.pendingTasks} pending tasks to review today.
              </Typography>
            )}
          </Box>

          {user.role === 'admin' && (
            <Box sx={{ mt: { xs: 3, md: 0 }, position: 'relative', zIndex: 1 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => navigate('/tasks')}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontWeight: 'bold',
                  borderRadius: 3,
                  px: 3,
                  py: 1
                }}
              >
                Create New Task
              </Button>
            </Box>
          )}
        </Box>

        {/* Stats Grid - Row 1 */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Tasks" value={stats.tasks} icon={<TaskIcon />} color="primary.main" loading={statsLoading} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Pending" value={stats.pendingTasks} icon={<AccessTimeIcon />} color="warning.main" loading={statsLoading} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Completed" value={stats.completedTasks} icon={<CheckCircleIcon />} color="success.main" loading={statsLoading} />
          </Grid>
          {(isAdmin || isManager || stats.teams > 0 || statsLoading) && (
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Active Teams" value={stats.teams} icon={<GroupWorkIcon />} color="info.main" loading={statsLoading} />
            </Grid>
          )}
        </Grid>

        <Grid container spacing={3}>

          {/* ROW 1 */}
          {/* Distribution */}
          <Grid item xs={12} md={6} lg={4} xl={3}>
            <Box sx={{ height: CHART_HEIGHT }}>
              <TeamTaskDistribution />
            </Box>
          </Grid>

          {/* Completion Rate */}
          <Grid item xs={12} md={6} lg={4} xl={3}>
            <Box sx={{ height: CHART_HEIGHT }}>
              {isAdmin ? <UserTaskCompletionRate /> : <TaskStatusChart />}
            </Box>
          </Grid>

          {/* My Tasks */}
          <Grid item xs={12} lg={4} xl={3}>
            <Box sx={{ height: CHART_HEIGHT }}>
              <MyTasks /> {/* Handles scrolling internally */}
            </Box>
          </Grid>


          {/* ROW 2 */}
          {/* Due Date */}
          <Grid item xs={12} md={6} lg={4} xl={3}>
            <Box sx={{ height: CHART_HEIGHT }}>
              <TaskDueDateChart />
            </Box>
          </Grid>

          {/* Roles or Priority */}
          <Grid item xs={12} md={6} lg={4} xl={3}>
            <Box sx={{ height: CHART_HEIGHT }}>
              {isAdmin ? <UserRoleChart /> : <TaskPriorityChart />}
            </Box>
          </Grid>

          {/* Extra Widget or Priority for Admin */}
          {isAdmin && (
            <Grid item xs={12} lg={4} xl={3}>
              <Box sx={{ height: CHART_HEIGHT }}>
                <TaskPriorityChart />
              </Box>
            </Grid>
          )}

          {/* ROW 3: Recent Activity */}
          <Grid sx={isAdmin ? { maxWidth: 'sm' } : { maxWidth: 'xl' }}>
            <Box sx={{ height: isAdmin ? CHART_HEIGHT : 400 }}>
              <RecentActivity />
            </Box>
          </Grid>

        </Grid>
      </Container>
    </Fade>
  );
};

export default DashboardPage;
