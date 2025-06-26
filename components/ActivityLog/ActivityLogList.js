"use client";

import { useEffect, useState } from "react";
import { useActivityLog } from "../../context/ActivityLogContext";
import { useAuth } from "../../context/AuthContext";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  useTheme,
  Button
} from "@mui/material";
import {
  AddCircle as CreateIcon,
  Edit as UpdateIcon,
  Delete as DeleteIcon,
  AssignmentInd as AssignIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  HowToReg as RegisterIcon,
  PersonRemove as UnassignIcon,
  PersonRemove as PersonRemoveIcon,
  GroupAdd as GroupIcon,
  AccessTime as TimeIcon
} from "@mui/icons-material";

const actionConfig = {
  create: { icon: <CreateIcon />, color: "success" },
  update: { icon: <UpdateIcon />, color: "info" },
  delete: { icon: <DeleteIcon />, color: "error" },
  assign: { icon: <AssignIcon />, color: "primary" },
  unassign: { icon: <UnassignIcon />, color: "warning" },
  login: { icon: <LoginIcon />, color: "secondary" },
  logout: { icon: <LogoutIcon />, color: "grey" },
  register: { icon: <RegisterIcon />, color: "secondary" },
  add: { icon: <GroupIcon />, color: "primary" },
  remove: { icon: <PersonRemoveIcon />, color: "error" },
  default: { icon: <UpdateIcon />, color: "grey" }
};

const getActivityConfig = (action, theme) => {
  const key = action.toLowerCase().split(" ")[0];
  const config = actionConfig[key] || actionConfig.default;
  const paletteColor =
    config.color === "grey"
      ? theme.palette.grey[500]
      : theme.palette[config.color]?.main;
  return {
    icon: config.icon,
    color: paletteColor
  };
};

const ActivityLogList = () => {
  const { logs, loading, fetchLogs } = useActivityLog();
  const { user } = useAuth();
  const theme = useTheme();
  const [visibleLogsCount, setVisibleLogsCount] = useState(10);

  useEffect(() => {
    if (user) {
      fetchLogs().catch((error) =>
        console.error("Error fetching logs:", error)
      );
    }
  }, [fetchLogs, user]);

  const handleShowMore = () => {
    setVisibleLogsCount((prevCount) => prevCount + 5);
  };

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

  const visibleLogs = logs.slice(0, visibleLogsCount);

  return (
    <Box>
      <Box sx={{ position: "relative", pl: 3 }}>
        <Box
          sx={{
            position: "absolute",
            top: "20px",
            left: "20px",
            height: "calc(100% - 20px)",
            borderLeft: "2px solid",
            borderColor: "divider"
          }}
        />
        {visibleLogs.map((log) => {
          const config = getActivityConfig(log.action, theme);
          const logDate = new Date(log.createdAt);

          return (
            <Box
              key={log._id}
              sx={{
                display: "flex",
                mb: 3,
                position: "relative",
                "&:last-of-type": { mb: 0 }
              }}
            >
              <Avatar
                sx={{
                  bgcolor: config.color,
                  color: "white",
                  width: 44,
                  height: 44,
                  position: "absolute",
                  left: "-25px",
                  top: "15px",
                  border: "4px solid",
                  borderColor: "background.paper"
                }}
              >
                {config.icon}
              </Avatar>

              <Box sx={{ flex: 1, ml: 4, mt: 0.5 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1,
                      mb: 1
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {`${log.action}d a ${log.entity}`}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        bgcolor: "info.light",
                        color: "info.dark",
                        p: "4px 8px",
                        borderRadius: "12px"
                      }}
                    >
                      <TimeIcon sx={{ fontSize: "1rem" }} />
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>
                        {logDate.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ my: 1 }}
                  >
                    {log.details}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    By: {log.performedBy?.name || "System"}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          );
        })}
      </Box>
      {logs.length > visibleLogsCount && (
        <Box textAlign="center" mt={2}>
          <Button variant="contained" onClick={handleShowMore}>
            Show More
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ActivityLogList;
