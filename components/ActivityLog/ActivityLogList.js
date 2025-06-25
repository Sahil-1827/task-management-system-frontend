"use client";

import { useEffect } from "react";
import { useActivityLog } from "../../context/ActivityLogContext";
import { useAuth } from "../../context/AuthContext";
import { 
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Avatar
} from "@mui/material";
import { 
  AddCircle as CreateIcon,
  Edit as UpdateIcon,
  Delete as DeleteIcon,
  AssignmentInd as AssignIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  HowToReg as RegisterIcon
} from "@mui/icons-material";

const actionConfig = {
    create: { icon: <CreateIcon />, color: 'success.main' },
    update: { icon: <UpdateIcon />, color: 'info.main' },
    delete: { icon: <DeleteIcon />, color: 'error.main' },
    assign: { icon: <AssignIcon />, color: 'primary.main' },
    unassign: { icon: <AssignIcon sx={{color: 'action.disabled'}}/>, color: 'action.disabledBackground' },
    login: { icon: <LoginIcon />, color: 'secondary.main' },
    logout: { icon: <LogoutIcon />, color: 'text.secondary' },
    register: { icon: <RegisterIcon />, color: 'secondary.light' },
    default: { icon: <UpdateIcon />, color: 'grey.500' }
};

const getActivityConfig = (action) => {
    const key = action.toLowerCase().split(' ')[0];
    return actionConfig[key] || actionConfig.default;
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
    return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  }

  if (!logs || logs.length === 0) {
    return <Alert severity="info" sx={{ m: 2 }}>No activity logs found.</Alert>;
  }

  return (
    <Box>
      {logs.map((log, index) => {
        const config = getActivityConfig(log.action);
        const logDate = new Date(log.createdAt);

        return (
          <Box key={log._id} sx={{ display: 'flex', position: 'relative', pb: 3 }}>
            {/* Vertical Timeline */}
            <Box sx={{ position: 'absolute', top: '20px', left: '18px', height: '100%', borderLeft: '2px solid', borderColor: 'divider' }} />
            
            {/* Icon */}
            <Box sx={{ zIndex: 1, mr: 2 }}>
                <Avatar sx={{ bgcolor: config.color, width: 40, height: 40 }}>
                    {config.icon}
                </Avatar>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {log.performedBy?.name || 'System'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    {log.details}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {logDate.toLocaleDateString()} at {logDate.toLocaleTimeString()}
                </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default ActivityLogList;