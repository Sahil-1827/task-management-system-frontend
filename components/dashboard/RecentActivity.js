"use client";
import { useState, useEffect } from 'react';
import { useActivityLog } from '../../context/ActivityLogContext';
import { useNotifications } from '../../context/NotificationContext';
import { List, ListItem, ListItemText, Typography, Paper, CircularProgress, Box } from '@mui/material';

const RecentActivity = () => {
  const { logs, loading, fetchLogs } = useActivityLog();
  const { registerUpdateCallback, unregisterUpdateCallback } = useNotifications();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const callbackId = "recent-activity-dashboard";
    const handleDataUpdate = (entityType) => {
      // Only refetch if the update is related to tasks or teams, which generate activity logs
      if (entityType === "task" || entityType === "team" || entityType === "generic") {
        fetchLogs({ limit: 5 });
      }
    };

    registerUpdateCallback(callbackId, handleDataUpdate);
    fetchLogs({ limit: 5 }).then(() => setIsInitialLoad(false)); // Set initial load to false after first fetch

    return () => {
      unregisterUpdateCallback(callbackId);
    };
  }, [fetchLogs, registerUpdateCallback, unregisterUpdateCallback]);

  if (loading && logs.length === 0 && isInitialLoad) {
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