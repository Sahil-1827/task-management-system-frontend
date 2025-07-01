"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { useActivityLog } from "../../../../context/ActivityLogContext";
import {
  Container,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Grid,
  Chip,
  Alert
} from "@mui/material";
import axios from "axios";
import { toast } from 'react-toastify';

export default function EditTask({ params }) {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [id, setId] = useState(null);
  const { fetchLogs } = useActivityLog();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    assignedTo: [],
    tags: [],
  });
  const [task, setTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (params) {
      setId(params.id);
    }
  }, [params]);

  useEffect(() => {
    if (!id || !token) return;

    const fetchTask = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/tasks/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const taskData = response.data;
        setTask(taskData);
        setFormData({
          title: taskData.title,
          description: taskData.description || "",
          status: taskData.status,
          priority: taskData.priority,
          dueDate: taskData.dueDate ? taskData.dueDate.split("T")[0] : "",
          assignedTo: taskData.assignedTo.map((user) => user._id),
          tags: taskData.tags || [],
        });
        setTagInput("");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch task");
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch users");
      }
    };

    Promise.all([fetchTask(), fetchUsers()]).finally(() => setLoadingData(false));
  }, [id, token]);

  if (loading || loadingData) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") router.push("/login");
    return null;
  }

  if (user.role !== "admin" && user.role !== "manager") {
    router.push("/tasks");
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAssignedToChange = (e) => {
    setFormData({ ...formData, assignedTo: e.target.value });
  };

  const handleTagsChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      tags: value
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    });
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim() !== "") {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tagInput.trim()],
        });
      }
      setTagInput("");
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToDelete),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.assignedTo.length === 0) {
      toast.error("Please assign the task to at least one user");
      return;
    }

    try {
      setSubmitting(true);
      await axios.put(`http://localhost:5000/api/tasks/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Task updated successfully!");
      fetchLogs();
      setTimeout(() => router.push("/tasks"), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Edit Task
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <TextField
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
          required
        />
        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
          multiline
          rows={4}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={formData.status}
            onChange={handleChange}
            label="Status"
          >
            <MenuItem value="todo">Todo</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            label="Priority"
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Due Date"
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
          slotProps={{ htmlInput: { min: getTodayDate() }, inputLabel: { shrink: true } }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Assigned To</InputLabel>
          <Select
            multiple
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleAssignedToChange}
            label="Assigned To"
          >
            {users.map((user) => (
              <MenuItem key={user._id} value={user._id}>
                {user.name} ({user.email})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Add Tag"
          value={tagInput}
          onChange={handleTagInputChange}
          onKeyDown={handleTagKeyDown}
          fullWidth
          sx={{ mb: 2 }}
          placeholder="Type tag and press Enter or comma"
        />
        <Box sx={{ mb: 2 }}>
          {formData.tags.map((tag, idx) => (
            <Chip
              key={idx}
              label={tag}
              onDelete={() => handleDeleteTag(tag)}
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
        </Box>
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
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Updating..." : "Update Task"}
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => router.push("/tasks")}
          sx={{ ml: 2 }}
        >
          Cancel
        </Button>
      </Box>
    </Container>
  );
}