"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { List, ListItem, ListItemText, Typography, Paper, CircularProgress, Box, Chip } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const MyTasks = () => {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!token || !user) return;

    const fetchTasks = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/tasks?assignee=${user._id}&limit=5&status=In Progress,To Do`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(response.data.tasks);
      } catch (error) {
        console.error("Failed to fetch user's tasks", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [token, user]);

  if (loading) {
    return (
      <Paper sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
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
            onClick={() => router.push('/tasks')}
            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
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
              <Chip label={task.status} size="small" color={task.status === 'In Progress' ? 'warning' : 'info'} />
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