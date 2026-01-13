import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  Container,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Pagination,
  Grid,
  Skeleton,
  Tooltip
} from "@mui/material";
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../api";
import { useActivityLog } from "../context/ActivityLogContext";
import { useNotifications } from "../context/NotificationContext";
import StatusBadge from "../components/common/StatusBadge";

export default function Tasks() {
  const { user, token, loading } = useAuth();
  const { mode } = useTheme();
  const navigate = useNavigate();
  const { fetchLogs } = useActivityLog();
  const { registerUpdateCallback, unregisterUpdateCallback } =
    useNotifications();

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [tasks, setTasks] = useState([]);
  const [displayTasks, setDisplayTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "To Do",
    priority: "Medium",
    dueDate: getTodayDate(),
    assignee: "",
    team: ""
  });
  const [editTask, setEditTask] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    let tempErrors = {};
    if (!newTask.title) tempErrors.title = "Title is required";
    if (!newTask.description) tempErrors.description = "Description is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [tasksPerPage, setTasksPerPage] = useState(5); // State for tasks per page

  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [loadingTasks, setLoadingTasks] = useState(true); // New state for task loading


  useEffect(() => {
    const callbackId = "tasks-page";
    const handleDataUpdate = (entityType) => {
      setRefetchTrigger((prev) => prev + 1);
    };

    registerUpdateCallback(callbackId, handleDataUpdate);

    return () => {
      unregisterUpdateCallback(callbackId);
    };
  }, [registerUpdateCallback, unregisterUpdateCallback]);

  useEffect(() => {
    if (loading || !user) return;

    const fetchData = async () => {
      setLoadingTasks(true);
      try {
        const queryParams = new URLSearchParams({
          page,
          limit: tasksPerPage
        });

        const [tasksRes, usersRes, teamsRes] = await Promise.all([
          api.get(
            `/tasks?${queryParams.toString()}`
          ),
          api.get("/users"),
          api.get("/teams")
        ]);

        setTasks(tasksRes.data.tasks);
        setDisplayTasks(tasksRes.data.tasks);
        setTotalTasks(tasksRes.data.totalTasks);
        setTotalPages(tasksRes.data.totalPages);
        setUsers(usersRes.data);
        setTeams(teamsRes.data.teams || teamsRes.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch page data");
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchData();
  }, [
    token,
    user,
    loading,
    page,
    tasksPerPage,
    refetchTrigger
  ]);


  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const isUserAssigned = (task, currentUser, allTeams) => {
    if (!task || !currentUser || !allTeams) return false;

    const currentUserId = currentUser._id || currentUser.id;
    if (!currentUserId) return false;

    if (task.assignee && task.assignee._id === currentUserId) {
      return true;
    }

    if (task.team && task.team._id) {
      const assignedTeam = allTeams.find(t => t._id === task.team._id);
      if (assignedTeam && assignedTeam.members) {
        return assignedTeam.members.some(member => member._id === currentUserId);
      }
    }

    return false;
  };

  if (loading || !user) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateTeamMembers = (teamId) => {
    if (!teamId) return true;
    const selectedTeam = teams.find((team) => team._id === teamId);
    if (!selectedTeam) return false;
    return selectedTeam.members && selectedTeam.members.length > 0;
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (newTask.team && !validateTeamMembers(newTask.team)) {
      toast.error("Cannot assign task to a team with no members");
      return;
    }

    const taskData = {
      ...newTask,
      assignee: newTask.assignee || null,
      team: newTask.team || null
    };

    setActionLoading(true);
    try {
      if (editTask) {
        // Update
        await api.put(`/tasks/${editTask._id}`, taskData);
        toast.success("Task updated successfully");
      } else {
        // Create
        await api.post("/tasks", taskData);
        toast.success("Task created successfully!");
      }
      setOpenDialog(false);
      setNewTask({
        title: "",
        description: "",
        status: "To Do",
        priority: "Medium",
        dueDate: getTodayDate(),
        assignee: "",
        team: ""
      });
      setEditTask(null);
      setRefetchTrigger((prev) => prev + 1);
      fetchLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || (editTask ? "Failed to update task" : "Failed to create task"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      background: mode === 'dark' ? '#1e293b' : '#ffffff',
      color: mode === 'dark' ? '#f1f5f9' : '#1e293b'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/tasks/${taskId}`);
          Swal.fire({
            title: "Deleted!",
            text: "Task has been deleted.",
            icon: "success",
            background: mode === 'dark' ? '#1e293b' : '#ffffff',
            color: mode === 'dark' ? '#f1f5f9' : '#1e293b'
          });
          setRefetchTrigger((prev) => prev + 1);
          fetchLogs();
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to delete task");
        }
      }
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewTask({
      title: "",
      description: "",
      status: "To Do",
      priority: "Medium",
      dueDate: getTodayDate(),
      assignee: "",
      team: ""
    });
    setEditTask(null);
    setErrors({});
  };

  const handleEditTask = (task) => {
    setEditTask(task);
    setNewTask({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      assignee: task.assignee?._id || "",
      team: task.team?._id || ""
    });
    setOpenDialog(true);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };


  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(
        `/tasks/${taskId}`,
        { status: newStatus }
      );
      toast.success("Task status updated successfully!");
      setRefetchTrigger((prev) => prev + 1);
      fetchLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update task status");
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Task Management
      </Typography>

      {(user.role === "admin" || user.role === "manager") && (
        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setEditTask(null);
              setNewTask({
                title: "",
                description: "",
                status: "To Do",
                priority: "Medium",
                dueDate: getTodayDate(),
                assignee: "",
                team: ""
              });
              setErrors({});
              setOpenDialog(true);
            }}
          >
            Add New Task
          </Button>
        </Box>
      )}


      <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Assignee/Team</TableCell>
              {(user.role === "admin" || user.role === "manager") && (
                <TableCell>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingTasks ? (
              // Skeleton rows
              Array.from(new Array(tasksPerPage)).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  {(user.role === "admin" || user.role === "manager") && (
                    <TableCell>
                      <Box sx={{ display: 'flex' }}>
                        <Skeleton variant="circular" width={30} height={30} sx={{ mr: 1 }} />
                        <Skeleton variant="circular" width={30} height={30} />
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : displayTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={user.role === "admin" || user.role === "manager" ? 7 : 6} sx={{ textAlign: "center" }}>
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              displayTasks.map((task) => (
                <TableRow key={task._id}>
                  <TableCell component="th" scope="row">
                    {task.title}
                  </TableCell>
                  <TableCell>{task.description || "-"}</TableCell>
                  <TableCell>
                    {(user.role === 'user' && isUserAssigned(task, user, teams)) ? (
                      <FormControl fullWidth size="small">
                        <Select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        >
                          <MenuItem value="To Do">To Do</MenuItem>
                          <MenuItem value="In Progress">In Progress</MenuItem>
                          <MenuItem value="Done">Done</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <StatusBadge status={task.status} size="small" />
                    )}
                  </TableCell>
                  <TableCell><StatusBadge status={task.priority} size="small" /></TableCell>
                  <TableCell>
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {task.assignee?.name || task.team?.name || "-"}
                  </TableCell>
                  {(user.role === "admin" || user.role === "manager") && (
                    <TableCell>
                      <Tooltip title="Edit" placement="top" arrow>
                        <IconButton onClick={() => handleEditTask(task)}>
                          <EditIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete" placement="top" arrow>
                        <IconButton onClick={() => handleDeleteTask(task._id)}>
                          <DeleteForeverTwoToneIcon color="error" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
      <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
        Total Tasks: {totalTasks}
      </Typography>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        style={{ backdropFilter: "blur(3px)" }}
      >
        <DialogTitle>
          {editTask ? "Edit Task" : "Add Task"}
        </DialogTitle>

        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmitTask}
            id="task-form"
            sx={{
              mt: 1,
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 2,
            }}
          >
            {/* Task Title */}
            <TextField
              label="Task Title"
              name="title"
              value={newTask.title}
              onChange={handleInputChange}
              fullWidth
              // required
              error={!!errors.title}
              helperText={errors.title}
            />

            {/* Description */}
            <TextField
              label="Description"
              name="description"
              value={newTask.description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
              error={!!errors.description}
              helperText={errors.description}
            />

            {/* Status */}
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={newTask.status}
                onChange={handleInputChange}
                label="Status"
              >
                <MenuItem value="To Do">To Do</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Done">Done</MenuItem>
              </Select>
            </FormControl>

            {/* Priority */}
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={newTask.priority}
                onChange={handleInputChange}
                label="Priority"
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
            </FormControl>

            {/* Due Date */}
            <TextField
              label="Due Date"
              name="dueDate"
              type="date"
              value={newTask.dueDate}
              onChange={handleInputChange}
              fullWidth
              slotProps={{
                htmlInput: { min: getTodayDate() },
                inputLabel: { shrink: true },
              }}
            />

            {/* Assignee */}
            <FormControl fullWidth disabled={!!newTask.team}>
              <InputLabel>Assignee</InputLabel>
              <Select
                name="assignee"
                value={newTask.assignee}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    assignee: e.target.value,
                    team: "",
                  })
                }
                label="Assignee"
              >
                <MenuItem value="">None</MenuItem>
                {users.map((u) => (
                  <MenuItem key={u._id} value={u._id}>
                    {u.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Team */}
            <FormControl fullWidth disabled={!!newTask.assignee}>
              <InputLabel>Team</InputLabel>
              <Select
                name="team"
                value={newTask.team}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    team: e.target.value,
                    assignee: "",
                  })
                }
                label="Team"
              >
                <MenuItem value="">None</MenuItem>
                {teams.map((t) => (
                  <MenuItem key={t._id} value={t._id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="task-form"
            variant="contained"
            loading={actionLoading}
            loadingPosition="end"
          >
            {editTask ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}
