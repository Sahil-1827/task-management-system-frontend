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
        const { data } = await api.get('/dashboard/stats');

        setStats({
          users: data.totalUsers || 0,
          tasks: data.totalTasks.value,
          tasksTrend: data.totalTasks.trend,
          teams: data.activeTeams.value,
          teamsTrend: data.activeTeams.trend,
          completedTasks: data.completedTasks.value,
          completedTasksTrend: data.completedTasks.trend,
          pendingTasks: data.pendingTasks.value,
          pendingTasksTrend: data.pendingTasks.trend,
          highPriorityTasks: data.highPriorityTasks || 0,
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
      <Container maxWidth="2xl" sx={{ py: 3, overflowX: 'hidden' }}>
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

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 3,
          mb: 4
        }}>
          <StatCard title="Total Tasks" value={stats.tasks} trend={stats.tasksTrend} icon={<TaskIcon />} color="primary.main" loading={statsLoading} />
          <StatCard title="Pending" value={stats.pendingTasks} trend={stats.pendingTasksTrend} icon={<AccessTimeIcon />} color="warning.main" loading={statsLoading} />
          <StatCard title="Completed" value={stats.completedTasks} trend={stats.completedTasksTrend} icon={<CheckCircleIcon />} color="success.main" loading={statsLoading} />
          {(isAdmin || isManager || stats.teams > 0 || statsLoading) && (
            <StatCard title="Active Teams" value={stats.teams} trend={stats.teamsTrend} icon={<GroupWorkIcon />} color="info.main" loading={statsLoading} />
          )}
        </Box>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
            xl: 'repeat(4, 1fr)'
          },
          gap: 3
        }}>

          <Box sx={{ height: CHART_HEIGHT, minWidth: 0 }}>
            <TeamTaskDistribution />
          </Box>

          <Box sx={{
            height: CHART_HEIGHT,
            minWidth: 0,
            gridColumn: {
              md: isAdmin ? 'span 2' : 'span 1',
              lg: isAdmin ? 'span 2' : 'span 1'
            }
          }}>
            {isAdmin ? <UserTaskCompletionRate /> : <TaskStatusChart />}
          </Box>

          <Box sx={{ height: CHART_HEIGHT, minWidth: 0 }}>
            <MyTasks />
          </Box>

          <Box sx={{ height: CHART_HEIGHT, minWidth: 0 }}>
            <TaskDueDateChart />
          </Box>

          <Box sx={{ height: CHART_HEIGHT, minWidth: 0 }}>
            {isAdmin ? <UserRoleChart /> : <TaskPriorityChart />}
          </Box>

          {isAdmin && (
            <Box sx={{ height: CHART_HEIGHT, minWidth: 0 }}>
              <TaskPriorityChart />
            </Box>
          )}

          <Box sx={{
            height: isAdmin ? CHART_HEIGHT : 400,
            minWidth: 0,
            gridColumn: {
              md: 'span 2',
              lg: 'span 2'
            }
          }}>
            <RecentActivity />
          </Box>

        </Box>
      </Container>
    </Fade>
  );
};

export default DashboardPage;
