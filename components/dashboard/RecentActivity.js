"use client";
import { useEffect } from 'react';
import { useActivityLog } from '../../context/ActivityLogContext';
import { List, ListItem, ListItemText, Typography, Paper, CircularProgress, Box } from '@mui/material';

const RecentActivity = () => {
  const { logs, loading, fetchLogs } = useActivityLog();

  useEffect(() => {
    fetchLogs({ limit: 5 });
  }, [fetchLogs]);

  if (loading && logs.length === 0) {
    return (
      <Paper sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>Recent Activity</Typography>
      {logs.length > 0 ? (
        <List>
          {logs.slice(0, 5).map(log => (
            <ListItem key={log._id} dense>
              <ListItemText
                primary={log.details}
                secondary={`By ${log.performedBy?.name || 'System'} on ${new Date(log.createdAt).toLocaleDateString()}`}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{mt: 2}}>
          No recent activity to display.
        </Typography>
      )}
    </Paper>
  );
};

export default RecentActivity;