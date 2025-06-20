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
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import Notification from "../../components/Notification";
import useDebounce from "../../hooks/useDebounce";

export default function Teams() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [displayTeams, setDisplayTeams] = useState([]); // For sorted display
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
    members: [],
  });
  const [editTeam, setEditTeam] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Pagination, search, and filter states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTeams, setTotalTeams] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500); // Debounce search input
  const [filterMember, setFilterMember] = useState("");

  // Sorting states
  const [sortField, setSortField] = useState(""); // name, createdAt
  const [sortDirection, setSortDirection] = useState("asc"); // asc, desc

  useEffect(() => {
    if (loading || !user) return;

    const fetchTeams = async () => {
      try {
        const queryParams = new URLSearchParams({
          page,
          limit: 5,
          search: debouncedSearch, // Use debounced search value
          ...(filterMember && { member: filterMember }),
        });

        const response = await axios.get(`http://localhost:5000/api/teams?${queryParams.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTeams(response.data.teams);
        setDisplayTeams(response.data.teams); // Initialize displayTeams
        setTotalTeams(response.data.totalTeams);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch teams");
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch users");
      }
    };

    fetchTeams();
    if (user.role !== "user") {
      fetchUsers();
    }
  }, [token, user, loading, page, debouncedSearch, filterMember]);

  // Sorting logic
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

  const handleMembersChange = (e) => {
    setNewTeam({ ...newTeam, members: e.target.value });
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newTeam.name) {
      setError("Team name is required");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/teams",
        newTeam,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTeams([...teams, response.data]);
      setSuccess("Team created successfully");
      setNewTeam({
        name: "",
        description: "",
        members: [],
      });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create team");
    }
  };

  const handleEditTeam = (team) => {
    setEditTeam(team);
    setNewTeam({
      name: team.name,
      description: team.description || "",
      members: team.members.map((member) => member._id),
    });
    setOpenDialog(true);
  };

  const handleUpdateTeam = async () => {
    setError("");
    setSuccess("");

    if (!newTeam.name) {
      setError("Team name is required");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/teams/${editTeam._id}`,
        newTeam,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTeams(teams.map((team) => (team._id === editTeam._id ? response.data : team)));
      setSuccess("Team updated successfully");
      setOpenDialog(false);
      setNewTeam({ name: "", description: "", members: [] });
      setEditTeam(null);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update team");
    }
  };

  const handleDeleteTeam = async (teamId) => {
    setError("");
    setSuccess("");

    try {
      await axios.delete(`http://localhost:5000/api/teams/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeams(teams.filter((team) => team._id !== teamId));
      setSuccess("Team deleted successfully");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete team");
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewTeam({ name: "", description: "", members: [] });
    setEditTeam(null);
  };

  const handleTeamUpdate = () => {
    console.log("Team update notification received, fetching teams...", { userId: user?._id });
    const fetchTeams = async () => {
      try {
        const queryParams = new URLSearchParams({
          page,
          limit: 5,
          search: debouncedSearch,
          ...(filterMember && { member: filterMember }),
        });

        const response = await axios.get(`http://localhost:5000/api/teams?${queryParams.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTeams(response.data.teams);
        setTotalTeams(response.data.totalTeams);
        setTotalPages(response.data.totalPages);
        console.log("Teams updated successfully");
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch teams");
      }
    };
    fetchTeams();
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterMemberChange = (e) => {
    setFilterMember(e.target.value);
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
    setFilterMember("");
    setSortField("");
    setSortDirection("asc");
    setPage(1);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Notification userId={user?.id} onTeamUpdate={handleTeamUpdate} />
      <Typography variant="h4" sx={{ mb: 4 }}>
        Team Management
      </Typography>

      {(user.role === "admin" || user.role === "manager") && (
        <Box component="form" onSubmit={handleCreateTeam} sx={{ mb: 4 }}>
          <TextField
            label="Team Name"
            name="name"
            value={newTeam.name}
            onChange={handleInputChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            name="description"
            value={newTeam.description}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Members</InputLabel>
            <Select
              multiple
              name="members"
              value={newTeam.members}
              onChange={handleMembersChange}
              label="Members"
            >
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" color="primary">
            Create Team
          </Button>
        </Box>
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

      {/* Search, Filters, and Sorting */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Search by Name or Description"
              value={search}
              onChange={handleSearchChange}
              fullWidth
              sx={{ mb: 2 }}
            />
          </Grid>
          {(user.role === "admin" || user.role === "manager") && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Filter by Member</InputLabel>
                <Select
                  value={filterMember}
                  onChange={handleFilterMemberChange}
                  label="Filter by Member"
                >
                  <MenuItem value="">All</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortField}
                onChange={handleSortFieldChange}
                label="Sort By"
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="createdAt">Creation Date</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Sort Direction</InputLabel>
              <Select
                value={sortDirection}
                onChange={handleSortDirectionChange}
                label="Sort Direction"
                disabled={!sortField}
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleClearFilters}
              sx={{ mt: 1 }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      <TableContainer component={Paper}>
        <Table>
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
            {displayTeams.map((team) => (
              <TableRow key={team._id}>
                <TableCell>{team.name}</TableCell>
                <TableCell>{team.description || "-"}</TableCell>
                <TableCell>
                  {team.members && team.members.length > 0
                    ? team.members.map((member) => member.name).join(", ")
                    : "-"}
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
      <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
        Total Teams: {totalTeams}
      </Typography>

      {/* Edit Team Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Edit Team</DialogTitle>
        <DialogContent>
          <TextField
            label="Team Name"
            name="name"
            value={newTeam.name}
            onChange={handleInputChange}
            fullWidth
            required
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            label="Description"
            name="description"
            value={newTeam.description}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Members</InputLabel>
            <Select
              multiple
              name="members"
              value={newTeam.members}
              onChange={handleMembersChange}
              label="Members"
            >
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUpdateTeam} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
