"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Skeleton,
} from "@mui/material";
import axios from "axios";
import { toast } from 'react-toastify';

export default function Profile() {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
    if (user) {
      setFormData({ name: user.name, email: user.email });
    }
  }, [user, loading, router]);

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const handleEditProfile = () => {
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.email) {
        toast.error("Name and email are required");
        return;
      }

      const response = await axios.put(
        "http://localhost:5000/api/users/profile",
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      toast.success("Profile updated successfully");
      setOpenDialog(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading || !user) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          User Profile
        </Typography>
        <Paper sx={{ p: { xs: 2, md: 4 } }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Skeleton variant="circular" width={80} height={80} sx={{ mr: 2 }} />
            <Box>
              <Skeleton variant="text" width={150} height={30} />
              <Skeleton variant="text" width={100} height={20} />
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Email:</strong> <Skeleton variant="text" width={200} />
            </Typography>
            <Typography variant="body1">
              <strong>Joined:</strong> <Skeleton variant="text" width={150} />
            </Typography>
          </Box>

          <Skeleton variant="rectangular" width={120} height={36} />
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        User Profile
      </Typography>
      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "primary.main",
              fontSize: "1.5rem",
            }}
          >
            {getInitials(user.name)}
          </Avatar>
          <Box>
            <Typography variant="h6">{user.name}</Typography>
            <Typography color="textSecondary" sx={{textTransform: 'capitalize'}}>{user.role}</Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Email:</strong> {user.email}
          </Typography>
          <Typography variant="body1">
            <strong>Joined:</strong>{" "}
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Not available"}
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={handleEditProfile}
        >
          Edit Profile
        </Button>
      </Paper>

      <Dialog open={openDialog} onClose={handleClose}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Name"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleInputChange}
          />
          </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}