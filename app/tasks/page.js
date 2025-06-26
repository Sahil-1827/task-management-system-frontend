"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
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
  Alert,
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
  Grid
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import useDebounce from "../../hooks/useDebounce";
import { useActivityLog } from "../../context/ActivityLogContext";
import { useNotifications } from "../../context/NotificationContext";

export default function Tasks() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const { fetchLogs } = useActivityLog();
  const { registerUpdateCallback, unregisterUpdateCallback } =
    useNotifications();

  const [tasks, setTasks] = useState([]);
  const [displayTasks, setDisplayTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "To Do",
    priority: "Medium",
    dueDate: "",
    assignee: "",
    team: ""
  });
  const [editTask, setEditTask] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [filterTeam, setFilterTeam] = useState("");

  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const callbackId = "tasks-page";
    const handleDataUpdate = (entityType) => {
      if (entityType === "task" || entityType === "team") {
        setRefetchTrigger((prev) => prev + 1);
      }
    };

    registerUpdateCallback(callbackId, handleDataUpdate);

    return () => {
      unregisterUpdateCallback(callbackId);
    };
  }, [registerUpdateCallback, unregisterUpdateCallback]);

  useEffect(() => {
    if (loading || !user) return;

    const fetchTasks = async () => {
      try {
        const queryParams = new URLSearchParams({
          page,
          limit: 5,
          search: debouncedSearch,
          ...(filterStatus && { status: filterStatus }),
          ...(filterPriority && { priority: filterPriority }),
          ...(filterAssignee && { assignee: filterAssignee }),
          ...(filterTeam && { team: filterTeam })
        });

        const response = await axios.get(
          `http://localhost:8080/api/tasks?${queryParams.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setTasks(response.data.tasks);
        setDisplayTasks(response.data.tasks);
        setTotalTasks(response.data.totalTasks);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch tasks");
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/users", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch users");
      }
    };

    const fetchTeams = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/teams", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTeams(response.data.teams || response.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch teams");
      }
    };

    fetchTasks();
    if (user.role !== "user") {
      fetchUsers();
      fetchTeams();
    }
  }, [
    token,
    user,
    loading,
    page,
    debouncedSearch,
    filterStatus,
    filterPriority,
    filterAssignee,
    filterTeam,
    refetchTrigger
  ]);

  useEffect(() => {
    if (!tasks || tasks.length === 0) return;

    const sortedTasks = [...tasks];
    if (sortField) {
      sortedTasks.sort((a, b) => {
        let valueA, valueB;

        if (sortField === "dueDate") {
          valueA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          valueB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        } else if (sortField === "priority") {
          const priorityOrder = { Low: 1, Medium: 2, High: 3 };
          valueA = priorityOrder[a.priority] || 0;
          valueB = priorityOrder[b.priority] || 0;
        } else if (sortField === "createdAt") {
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
        }

        if (sortDirection === "asc") {
          return valueA - valueB;
        } else {
          return valueB - valueA;
        }
      });
    }
    setDisplayTasks(sortedTasks);
  }, [tasks, sortField, sortDirection]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  const handleInputChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  const validateTeamMembers = (teamId) => {
    if (!teamId) return true;
    const selectedTeam = teams.find((team) => team._id === teamId);
    if (!selectedTeam) return false;
    return selectedTeam.members && selectedTeam.members.length > 0;
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await axios.post("http://localhost:8080/api/tasks", newTask, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewTask({
        title: "",
        description: "",
        status: "To Do",
        priority: "Medium",
        dueDate: "",
        assignee: "",
        team: ""
      });
      setSuccess("Task created successfully!");
      fetchLogs();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create task");
    }
  };

  const handleUpdateTask = async () => {
    setError("");
    setSuccess("");

    if (!newTask.title) {
      setError("Task title is required");
      return;
    }

    if (newTask.team && !validateTeamMembers(newTask.team)) {
      setError("Cannot assign task to a team with no members");
      return;
    }

    const taskData = {
      ...newTask,
      assignee: newTask.assignee || null,
      team: newTask.team || null
    };

    try {
      await axios.put(
        `http://localhost:8080/api/tasks/${editTask._id}`,
        taskData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSuccess("Task updated successfully");
      setOpenDialog(false);
      setNewTask({
        title: "",
        description: "",
        status: "To Do",
        priority: "Medium",
        dueDate: "",
        assignee: "",
        team: ""
      });
      setEditTask(null);
      fetchLogs();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    setError("");
    setSuccess("");

    try {
      await axios.delete(`http://localhost:8080/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Task deleted successfully");
      fetchLogs();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete task");
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewTask({
      title: "",
      description: "",
      status: "To Do",
      priority: "Medium",
      dueDate: "",
      assignee: "",
      team: ""
    });
    setEditTask(null);
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

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleSortFieldChange = (e) => {
    setSortField(e.target.value);
  };

  const handleSortDirectionChange = (e) => {
    setSortDirection(e.target.value);
  };

  const handleClearFilters = () => {
    setSearch("");
    setFilterStatus("");
    setFilterPriority("");
    setFilterAssignee("");
    setFilterTeam("");
    setSortField("");
    setSortDirection("asc");
    setPage(1);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Task Management
      </Typography>

      {(user.role === "admin" || user.role === "manager") && (
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Create New Task
          </Typography>
          <Box component="form" onSubmit={handleCreateTask}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Task Title"
                  name="title"
                  value={newTask.title}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  name="description"
                  value={newTask.description}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
              </Grid>
              <Grid item xs={12} sm={6}>
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Due Date"
                  name="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={handleInputChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={!!newTask.team}>
                  <InputLabel>Assignee</InputLabel>
                  <Select
                    name="assignee"
                    value={newTask.assignee}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        assignee: e.target.value,
                        team: ""
                      })
                    }
                    label="Assignee"
                  >
                    <MenuItem value="">None</MenuItem>
                    {users.map((u) => (
                      <MenuItem key={u._id} value={u._id}>
                        {u.name} ({u.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={!!newTask.assignee}>
                  <InputLabel>Team</InputLabel>
                  <Select
                    name="team"
                    value={newTask.team}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        team: e.target.value,
                        assignee: ""
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
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  Create Task
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Filters & Sorting
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Search by Title or Description"
              value={search}
              onChange={handleSearchChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={handleFilterChange(setFilterStatus)}
                label="Filter by Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="To Do">To Do</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Done">Done</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Priority</InputLabel>
              <Select
                value={filterPriority}
                onChange={handleFilterChange(setFilterPriority)}
                label="Filter by Priority"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {(user.role === "admin" || user.role === "manager") && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Assignee</InputLabel>
                  <Select
                    value={filterAssignee}
                    onChange={handleFilterChange(setFilterAssignee)}
                    label="Filter by Assignee"
                  >
                    <MenuItem value="">All</MenuItem>
                    {users.map((u) => (
                      <MenuItem key={u._id} value={u._id}>
                        {u.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Team</InputLabel>
                  <Select
                    value={filterTeam}
                    onChange={handleFilterChange(setFilterTeam)}
                    label="Filter by Team"
                  >
                    <MenuItem value="">All</MenuItem>
                    {teams.map((t) => (
                      <MenuItem key={t._id} value={t._id}>
                        {t.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortField}
                onChange={handleSortFieldChange}
                label="Sort By"
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="dueDate">Due Date</MenuItem>
                <MenuItem value="priority">Priority</MenuItem>
                <MenuItem value="createdAt">Creation Date</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth disabled={!sortField}>
              <InputLabel>Sort Direction</InputLabel>
              <Select
                value={sortDirection}
                onChange={handleSortDirectionChange}
                label="Sort Direction"
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button variant="outlined" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
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
            {displayTasks.map((task) => (
              <TableRow key={task._id}>
                <TableCell component="th" scope="row">
                  {task.title}
                </TableCell>
                <TableCell>{task.status}</TableCell>
                <TableCell>{task.priority}</TableCell>
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
                    <IconButton onClick={() => handleEditTask(task)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteTask(task._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
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
      >
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Task Title"
                name="title"
                value={newTask.title}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={newTask.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
            </Grid>
            <Grid item xs={12} sm={6}>
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Due Date"
                name="dueDate"
                type="date"
                value={newTask.dueDate}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!!newTask.team}>
                <InputLabel>Assignee</InputLabel>
                <Select
                  name="assignee"
                  value={newTask.assignee}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      assignee: e.target.value,
                      team: ""
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!!newTask.assignee}>
                <InputLabel>Team</InputLabel>
                <Select
                  name="team"
                  value={newTask.team}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      team: e.target.value,
                      assignee: ""
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
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleUpdateTask} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
