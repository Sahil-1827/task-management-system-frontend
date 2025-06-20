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
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";

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
    setError("");
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.email) {
        setError("Name and email are required");
        return;
      }

      // Update this line in handleSubmit function
      const response = await axios.put(
        "http://localhost:5000/api/users/profile",  // Changed from /api/auth/profile to /api/users/profile
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      setSuccess("Profile updated successfully");
      setOpenDialog(false);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading || !user) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        User Profile
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "primary.main",
              fontSize: "1.5rem",
              mr: 2,
            }}
          >
            {getInitials(user.name)}
          </Avatar>
          <Box>
            <Typography variant="h6">{user.name}</Typography>
            <Typography color="textSecondary">{user.role}</Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Email:</strong> {user.email}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Role:</strong> {user.role}
          </Typography>
          <Typography variant="body1">
            <strong>Joined:</strong>{" "}
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Not available"}
          </Typography>
        </Box>

        {/* <Button
          variant="contained"
          color="primary"
          onClick={handleEditProfile}
        >
          Edit Profile
        </Button> */}
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
            error={error.includes("Name")}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleInputChange}
            error={error.includes("Email")}
          />
          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess("")}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
}