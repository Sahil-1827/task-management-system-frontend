import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { toast } from 'react-toastify';
import api from '../api';

export default function SignUp() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard'); // Redirect to dashboard if already logged in
    }
  }, [user, loading, navigate]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { name, email, password, role });
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      // The centralized error handler in api.js will show the toast.
      // No need to duplicate toast.error here unless for specific logic.
      console.error("Registration failed:", error); 
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <Container sx={{ py: 4, maxWidth: '400px' }}>
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
        Sign Up
      </Typography>
      <Box component="form" onSubmit={handleSignUp}>
        <TextField
          label="Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="role-label">Role</InputLabel>
          <Select
            labelId="role-label"
            value={role}
            label="Role"
            onChange={(e) => setRole(e.target.value)}
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Sign Up
        </Button>
      </Box>
    </Container>
  );
}