import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
  Skeleton
} from "@mui/material";
import { toast } from 'react-toastify';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../api";
import useDebounce from "../hooks/useDebounce";
import { useActivityLog } from "../context/ActivityLogContext";
import { useNotifications } from "../context/NotificationContext";

export default function Tasks() {
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();
  const { fetchLogs } = useActivityLog();
  const { registerUpdateCallback, unregisterUpdateCallback } =
    useNotifications();

  const [tasks, setTasks] = useState([]);
  const [displayTasks, setDisplayTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
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
  const [tasksPerPage, setTasksPerPage] = useState(5); // State for tasks per page
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [filterTeam, setFilterTeam] = useState("");

  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [loadingTasks, setLoadingTasks] = useState(true); // New state for task loading

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
                limit: tasksPerPage,
                search: debouncedSearch,
                ...(filterStatus && { status: filterStatus }),
                ...(filterPriority && { priority: filterPriority }),
                ...(filterAssignee && { assignee: filterAssignee }),
                ...(filterTeam && { team: filterTeam })
            });

            const [tasksRes, usersRes, teamsRes] = await Promise.all([
                api.get(
                    `/tasks?${queryParams.toString()}`
                ),
                api.get("/users"),
                api.get("/teams")
            ]);

            setTasks(tasksRes.data.tasks);
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
    debouncedSearch,
    filterStatus,
    filterPriority,
    filterAssignee,
    filterTeam,
    refetchTrigger
  ]);

  useEffect(() => {
    if (!tasks || tasks.length === 0) {
        setDisplayTasks([]);
        return;
    };

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
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
    }
    setDisplayTasks(sortedTasks);
  }, [tasks, sortField, sortDirection]);

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
    try {
      await api.post("/tasks", newTask);
      setNewTask({
        title: "",
        description: "",
        status: "To Do",
        priority: "Medium",
        dueDate: "",
        assignee: "",
        team: ""
      });
      toast.success("Task created successfully!");
      setRefetchTrigger((prev) => prev + 1);
      fetchLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create task");
    }
  };

  const handleUpdateTask = async () => {
    if (!newTask.title) {
      toast.error("Task title is required");
      return;
    }

    if (newTask.team && !validateTeamMembers(newTask.team)) {
      toast.error("Cannot assign task to a team with no members");
      return;
    }

    const taskData = {
      ...newTask,
      assignee: newTask.assignee || null,
      team: newTask.team || null
    };

    try {
      await api.put(
        `/tasks/${editTask._id}`,
        taskData
      );
      toast.success("Task updated successfully");
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
      setRefetchTrigger((prev) => prev + 1);
      fetchLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success("Task deleted successfully");
      setRefetchTrigger((prev) => prev + 1);
      fetchLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete task");
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
                  slotProps={{ htmlInput: { min: getTodayDate() }, inputLabel: { shrink: true } }}
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
                      task.status
                  )}
                  </TableCell>
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
                slotProps={{ htmlInput: { min: getTodayDate() }, inputLabel: { shrink: true } }}
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
