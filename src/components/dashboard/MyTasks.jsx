import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { List, ListItem, ListItemText, Typography, Paper, Box, Chip, Skeleton, Button, Avatar, Divider, IconButton } from '@mui/material';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const MyTasks = () => {
  const { user, token } = useAuth();
  const { registerUpdateCallback, unregisterUpdateCallback } = useNotifications();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const callbackId = "my-tasks-dashboard";
    const handleDataUpdate = (entityType) => {
      if (entityType === "task") {
        setRefetchTrigger((prev) => prev + 1);
      }
    };

    registerUpdateCallback(callbackId, handleDataUpdate);

    return () => {
      unregisterUpdateCallback(callbackId);
    };
  }, [registerUpdateCallback, unregisterUpdateCallback]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!token || !user) {
        setLoading(false);
        return;
      }
      if (isInitialLoad) {
        setLoading(true);
      }

      try {
        const response = await api.get(`/tasks?assignee=${user._id}&limit=5&status=In Progress,To Do`);
        setTasks(response.data.tasks);
      } catch (error) {
        console.error("Failed to fetch user's tasks", error);
        setTasks([]);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchTasks();
  }, [token, user, refetchTrigger]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'warning';
      case 'Done':
        return 'success';
      default:
        return 'info';
    }
  };

  const LoadingSkeleton = () => (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Skeleton variant="text" width={140} height={32} />
        <Skeleton variant="circular" width={32} height={32} />
      </Box>
      <List>
        {[...Array(4)].map((_, index) => (
          <Box key={index}>
            <ListItem alignItems="flex-start" disableGutters>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={20} />
              </Box>
            </ListItem>
            {index < 3 && <Divider variant="inset" component="li" />}
          </Box>
        ))}
      </List>
    </Paper>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 32, height: 32 }}>
            <AssignmentIcon fontSize="small" />
          </Avatar>
          <Typography variant="h6" fontWeight="bold">My Tasks</Typography>
        </Box>
        <Button
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/tasks')}
          size="small"
          sx={{ borderRadius: 2 }}
        >
          View All
        </Button>
      </Box>

      {tasks.length > 0 ? (
        <List sx={{ flexGrow: 1, overflow: 'auto' }}>
          {tasks.map((task, index) => (
            <Box key={task._id}>
              <ListItem
                alignItems="center"
                disableGutters
                sx={{
                  py: 1.5
                }}
              >
                <Box sx={{ mr: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}>
                  <Chip
                    label={task.priority?.charAt(0)}
                    size="small"
                    color={task.priority === 'High' ? 'error' : task.priority === 'Medium' ? 'warning' : 'default'}
                    sx={{ width: 24, height: 24, fontSize: '0.75rem', '& .MuiChip-label': { px: 0 } }}
                  />
                </Box>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" fontWeight="medium" noWrap>
                      {task.title}
                    </Typography>
                  }
                  secondary={
                    <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                      <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                      </Typography>
                    </Box>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                />
                <Chip
                  label={task.status}
                  size="small"
                  color={getStatusColor(task.status)}
                  variant="outlined"
                  sx={{ ml: 1, height: 24, fontSize: '0.75rem' }}
                />
              </ListItem>
              {index < tasks.length - 1 && <Divider component="li" />}
            </Box>
          ))}
        </List>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, py: 4 }}>
          <Typography variant="body1" color="text.secondary" align="center">
            You have no open tasks. Great job!
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default MyTasks;
