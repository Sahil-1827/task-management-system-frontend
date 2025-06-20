"use client";

import { useEffect } from "react";
import { useActivityLog } from "../../context/ActivityLogContext";
import { useAuth } from "../../context/AuthContext";
import { 
  Box,
  Paper,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Avatar
} from "@mui/material";
import { 
  AddCircle as CreateIcon,
  Edit as UpdateIcon,
  Delete as DeleteIcon,
  AssignmentInd as AssignIcon,
  Refresh as StatusIcon
} from "@mui/icons-material";

const getActionIcon = (action) => {
  switch (action.toLowerCase()) {
    case 'create': return <CreateIcon color="success" />;
    case 'update': return <UpdateIcon color="info" />;
    case 'delete': return <DeleteIcon color="error" />;
    case 'assign': return <AssignIcon color="primary" />;
    case 'status': return <StatusIcon color="warning" />;
    default: return null;
  }
};

const getActionColor = (action) => {
  switch (action.toLowerCase()) {
    case 'create': return 'success';
    case 'update': return 'info';
    case 'delete': return 'error';
    case 'assign': return 'primary';
    case 'status': return 'warning';
    default: return 'default';
  }
};

const getEntityColor = (entity) => {
  switch (entity.toLowerCase()) {
    case 'task': return 'primary';
    case 'team': return 'secondary';
    case 'user': return 'info';
    default: return 'default';
  }
};

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
};

const ActivityLogList = () => {
  const { logs, loading, fetchLogs } = useActivityLog();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchLogs().catch((error) => console.error("Error fetching logs:", error));
    }
  }, [fetchLogs, user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No activity logs found.
      </Alert>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Activity Log
      </Typography>
      <Stack spacing={2}>
        {logs.map((log) => (
          <Paper
            key={log._id}
            elevation={1}
            sx={{
              p: 2,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: 2
              }
            }}
          >
            <Box display="flex" alignItems="center" mb={1} gap={2}>
              <Avatar
                sx={{
                  bgcolor: `${getActionColor(log.action)}.main`,
                  width: 32,
                  height: 32,
                  fontSize: '0.875rem'
                }}
              >
                {getInitials(log.performedBy?.name || 'U')}
              </Avatar>
              <Box display="flex" alignItems="center" gap={1} flex={1}>
                {getActionIcon(log.action)}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600 }}
                  >
                    {log.performedBy?.name || 'Unknown User'}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      size="small"
                      label={log.action}
                      color={getActionColor(log.action)}
                      sx={{ 
                        textTransform: 'capitalize',
                        height: '20px'
                      }}
                    />
                    <Chip
                      label={log.entity}
                      size="small"
                      color={getEntityColor(log.entity)}
                      sx={{ 
                        textTransform: 'capitalize',
                        height: '20px'
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary' }}
              >
                {new Date(log.createdAt).toLocaleString()}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {log.details}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Paper>
  );
};

export default ActivityLogList;
