"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Alert,
} from "@mui/material";
import axios from "axios";
import { toast } from 'react-toastify';

export default function Users() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usersPerPage, setUsersPerPage] = useState(5); // Added for skeleton loading
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    } else if (!loading && user?.role !== "admin" && user?.role !== "manager") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;
      try {
        setIsLoading(true);
        setUsers([]); // Clear users to show skeletons immediately
        const response = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to fetch users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const handleViewProfile = (userToView) => {
    setSelectedUser(userToView);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  if (loading || isLoading) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (user?.role !== "admin" && user?.role !== "manager") {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">You are not authorized to view this page.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        User Management
      </Typography>

      <TableContainer component={Paper} sx={{overflowX: 'auto'}}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              // Skeleton rows
              Array.from(new Array(usersPerPage)).map((_, index) => (
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
                    <Skeleton variant="circular" width={30} height={30} />
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: "center" }}>
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{u.role}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewProfile(u)}
                    >
                      View Profile
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>User Profile</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 2 }}>
              <Typography gutterBottom><strong>Name:</strong> {selectedUser.name}</Typography>
              <Typography gutterBottom><strong>Email:</strong> {selectedUser.email}</Typography>
              <Typography gutterBottom sx={{ textTransform: 'capitalize' }}><strong>Role:</strong> {selectedUser.role}</Typography>
              <Typography>
                <strong>Member Since:</strong>{" "}
                {new Date(selectedUser.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}