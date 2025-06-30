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
import axios from "axios";
import useDebounce from "../../hooks/useDebounce";
import { useActivityLog } from "../../context/ActivityLogContext";
import { useNotifications } from "../../context/NotificationContext";

export default function Teams() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const { fetchLogs } = useActivityLog();
  const { registerUpdateCallback, unregisterUpdateCallback } =
    useNotifications();

  const [teams, setTeams] = useState([]);
  const [displayTeams, setDisplayTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
    members: []
  });
  const [editTeam, setEditTeam] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTeams, setTotalTeams] = useState(0);
  const [teamsPerPage, setTeamsPerPage] = useState(5); // State for teams per page
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [filterMember, setFilterMember] = useState("");

  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [loadingTeams, setLoadingTeams] = useState(true); // New state for team loading

  useEffect(() => {
    const callbackId = "teams-page";
    const handleDataUpdate = (entityType) => {
      if (entityType === "team") {
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

    const fetchTeams = async () => {
      setLoadingTeams(true); // Set loading to true before fetching
      setDisplayTeams([]); // Clear teams to show skeletons immediately
      try {
        const queryParams = new URLSearchParams({
          page,
          limit: 5,
          search: debouncedSearch,
          ...(filterMember && { member: filterMember })
        });

        const response = await axios.get(
          `http://localhost:5000/api/teams?${queryParams.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setTeams(response.data.teams);
        setDisplayTeams(response.data.teams);
        setTotalTeams(response.data.totalTeams);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch teams");
      } finally {
        setLoadingTeams(false); // Set loading to false after fetching (success or error)
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch users");
      }
    };

    fetchTeams();
    if (user.role !== "user") {
      fetchUsers();
    }
  }, [
    token,
    user,
    loading,
    page,
    debouncedSearch,
    filterMember,
    refetchTrigger
  ]);

  useEffect(() => {
    if (!teams || teams.length === 0) return;

    const sortedTeams = [...teams];
    if (sortField) {
      sortedTeams.sort((a, b) => {
        let valueA, valueB;

        if (sortField === "name") {
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
        } else if (sortField === "createdAt") {
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
        } else {
          return 0;
        }

        if (sortDirection === "asc") {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
    }
    setDisplayTeams(sortedTeams);
  }, [teams, sortField, sortDirection]);

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
    setNewTeam({ ...newTeam, [e.target.name]: e.target.value });
  };

  const handleMembersChange = (event) => {
    const {
      target: { value }
    } = event;
    setNewTeam({
      ...newTeam,
      members: typeof value === "string" ? value.split(",") : value
    });
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();

    if (!newTeam.name) {
      toast.error("Team name is required");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/teams", newTeam, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Team created successfully");
      setNewTeam({ name: "", description: "", members: [] });
      setRefetchTrigger((prev) => prev + 1); // Refetch data
      fetchLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create team");
    }
  };

  const handleEditTeam = (team) => {
    setEditTeam(team);
    setNewTeam({
      name: team.name,
      description: team.description || "",
      members: team.members.map((member) => member._id)
    });
    setOpenDialog(true);
  };

  const handleUpdateTeam = async () => {
    if (!newTeam.name) {
      toast.error("Team name is required");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/teams/${editTeam._id}`,
        newTeam,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success("Team updated successfully");
      handleCloseDialog();
      setRefetchTrigger((prev) => prev + 1); // Refetch data
      fetchLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update team");
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      await axios.delete(`http://localhost:5000/api/teams/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Team deleted successfully");
      setRefetchTrigger((prev) => prev + 1); // Refetch data
      fetchLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete team");
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewTeam({ name: "", description: "", members: [] });
    setEditTeam(null);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setFilterMember("");
    setSortField("");
    setSortDirection("asc");
    setPage(1);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Team Management
      </Typography>

      {(user.role === "admin" || user.role === "manager") && (
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Create New Team
          </Typography>
          <Box component="form" onSubmit={handleCreateTeam}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Team Name"
                  name="name"
                  value={newTeam.name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  name="description"
                  value={newTeam.description}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Members</InputLabel>
                  <Select
                    multiple
                    name="members"
                    value={newTeam.members}
                    onChange={handleMembersChange}
                    label="Members"
                  >
                    {users.map((u) => (
                      <MenuItem key={u._id} value={u._id}>
                        {u.name} ({u.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  Create Team
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
          <Grid item xs={12} sm={6}>
            <TextField
              label="Search by Name"
              value={search}
              onChange={handleFilterChange(setSearch)}
              fullWidth
            />
          </Grid>
          {(user.role === "admin" || user.role === "manager") && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Filter by Member</InputLabel>
                <Select
                  value={filterMember}
                  onChange={handleFilterChange(setFilterMember)}
                  label="Filter by Member"
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
          )}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="createdAt">Creation Date</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth disabled={!sortField}>
              <InputLabel>Sort Direction</InputLabel>
              <Select
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value)}
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
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Members</TableCell>
              <TableCell>Created By</TableCell>
              {(user.role === "admin" || user.role === "manager") && (
                <TableCell>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingTeams ? (
              // Skeleton rows
              Array.from(new Array(teamsPerPage)).map((_, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    <Skeleton variant="text" />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" />
                  </TableCell>
                  {(user.role === "admin" || user.role === "manager") && (
                    <TableCell>
                      <Skeleton variant="circular" width={30} height={30} sx={{ mr: 1 }} />
                      <Skeleton variant="circular" width={30} height={30} />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : displayTeams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={user.role === "admin" || user.role === "manager" ? 5 : 4} sx={{ textAlign: "center" }}>
                  No teams found.
                </TableCell>
              </TableRow>
            ) : (
              displayTeams.map((team) => (
                <TableRow key={team._id}>
                  <TableCell>{team.name}</TableCell>
                  <TableCell>{team.description || "-"}</TableCell>
                  <TableCell>
                    {team.members.map((member) => member.name).join(", ") || "-"}
                  </TableCell>
                  <TableCell>{team.createdBy?.name || "-"}</TableCell>
                  {(user.role === "admin" || user.role === "manager") && (
                    <TableCell>
                      <IconButton onClick={() => handleEditTeam(team)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteTeam(team._id)}>
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
        Total Teams: {totalTeams}
      </Typography>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Team</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Team Name"
                name="name"
                value={newTeam.name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={newTeam.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Members</InputLabel>
                <Select
                  multiple
                  name="members"
                  value={newTeam.members}
                  onChange={handleMembersChange}
                  label="Members"
                >
                  {users.map((u) => (
                    <MenuItem key={u._id} value={u._id}>
                      {u.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleUpdateTeam} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
