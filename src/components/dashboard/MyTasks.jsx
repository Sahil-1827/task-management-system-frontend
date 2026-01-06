import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { List, ListItem, ListItemText, Typography, Paper, CircularProgress, Box, Chip, Skeleton } from '@mui/material';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

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
        setLoading(true); // Set loading to true before fetching
      }

      try {
        const response = await api.get(`/tasks?assignee=${user._id}&limit=5&status=In Progress,To Do,Done`);
        setTasks(response.data.tasks);
      } catch (error) {
        console.error("Failed to fetch user's tasks", error);
        setTasks([]); // Clear tasks on error
      } finally {
        setLoading(false); // Always set loading to false
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

  if (loading) {
    return (
      <Paper sx={{ p: 2, height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="text" width={120} height={28} />
          <Skeleton variant="text" width={50} height={22} sx={{ ml: 1 }}/>
        </Box>
        <List>
          {[...Array(3)].map((_, index) => (
            <ListItem key={index} dense>
              <ListItemText
                primary={<Skeleton variant="text" width="80%" />}
                secondary={<Skeleton variant="text" width="40%" />}
              />
              <Skeleton variant="rectangular" width={60} height={20} />
            </ListItem>
          ))}
        </List>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" gutterBottom>My Open Tasks</Typography>
          <Typography
            variant="body2"
            color="primary"
            onClick={() => navigate('/tasks')}
            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' }, ml: 1 }}
          >
            View All
          </Typography>
      </Box>
      {tasks.length > 0 ? (
        <List>
          {tasks.map(task => (
            <ListItem key={task._id} dense>
              <ListItemText
                primary={task.title}
                secondary={`Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}`}
              />
              <Chip label={task.status} size="small" color={getStatusColor(task.status)} />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{mt: 2}}>
          You have no open tasks. Great job!
        </Typography>
      )}
    </Paper>
  );
};

export default MyTasks;
