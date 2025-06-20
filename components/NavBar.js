'use client';

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Image from "next/image";

const StyledButton = styled(Button)(({ theme }) => ({
  minWidth: '84px',
  maxWidth: '480px',
  borderRadius: '12px',
  height: '40px',
  padding: '0 16px',
  textTransform: 'none',
  fontWeight: 700,
  color: theme.palette.text.primary,
  '&.MuiButton-contained': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  '@media (min-width: 480px)': {
    height: '48px',
    padding: '0 20px',
    fontSize: '16px',
  },
}));

export default function NavBar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mode, toggleTheme } = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Tasks", path: "/tasks" },
    { label: "Teams", path: "/teams" }
  ];

  if (user?.role === "admin") {
    navItems.push({ label: "Users", path: "/users" });
  }

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ 
        my: 2,
        fontSize: { xs: '1.1rem', sm: '1.25rem' },
        color: 'text.primary'
      }}>
        Task Management System
      </Typography>
      <IconButton onClick={toggleTheme} sx={{ mb: 2, color: 'text.primary' }}>
        {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
      <List>
        {user ? (
          <>
            <ListItem
              onClick={() => router.push("/profile")}
              sx={{
                cursor: 'pointer',
                backgroundColor: pathname === "/profile" ? "#f0f0f0" : "inherit",
                '& .MuiListItemText-primary': {
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }
              }}
            >
              <ListItemText primary={`Profile (${user?.name || "User"})`} />
            </ListItem>
            {navItems.map((item) => (
              <ListItem
                key={item.label}
                onClick={() => router.push(item.path)}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: pathname === item.path ? "#f0f0f0" : "inherit",
                  '& .MuiListItemText-primary': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }
                }}
              >
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
            <ListItem onClick={handleLogout} sx={{
              cursor: 'pointer',
              '& .MuiListItemText-primary': {
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }
            }}>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem onClick={() => router.push("/signup")} sx={{
              cursor: 'pointer',
              '& .MuiListItemText-primary': {
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }
            }}>
              <ListItemText primary="Sign Up" />
            </ListItem>
            <ListItem onClick={() => router.push("/login")} sx={{
              cursor: 'pointer',
              '& .MuiListItemText-primary': {
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }
            }}>
              <ListItemText primary="Login" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      px: { xs: 2, sm: 3, md: 5 },
      py: 1.5,
      borderBottom: '1px solid',
      borderColor: 'divider'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={() => router.push('/')}>
        <Box sx={{ 
          width: { xs: 24, sm: 32 }, 
          height: { xs: 24, sm: 32 } 
        }}>
         <Image
           src="/logo.png"
           alt="Logo"
           width={32}
           height={32}
           style={{ objectFit: 'contain' }}
         />
        </Box>
        
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          letterSpacing: '-0.015em', 
          color: 'text.primary',
          fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
        }}>
          Task Management System
        </Typography>
      </Box>

      <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
        {user ? (
          <>
            {navItems.map((item) => (
              <StyledButton
                key={item.label}
                variant="text"
                onClick={() => router.push(item.path)}
                sx={{
                  color: 'text.primary',
                  borderBottom: pathname === item.path ? `3px solid ${mode === 'dark' ? '#818cf8' : '#6366f1'}` : "none",
                  borderRadius: 0,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                {item.label}
              </StyledButton>
            ))}
            <StyledButton
              variant="text"
              onClick={() => router.push("/profile")}
              sx={{
                color: '#1b3430',
                borderBottom: pathname === "/profile" ? "3px solid #1b3430" : "none",
                borderRadius: 0,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              {user?.name || "User"}
            </StyledButton>
            <IconButton onClick={toggleTheme} sx={{ ml: 2, color: '#1b3430' }}>
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <StyledButton
              variant="contained"
              onClick={handleLogout}
              sx={{ 
                bgcolor: 'grey',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Logout
            </StyledButton>
          </>
        ) : (
          <>
            <StyledButton
              variant="contained"
              onClick={() => router.push('/signup')}
              sx={{ 
                bgcolor: '#1b3430',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Sign Up
            </StyledButton>
            <StyledButton
              variant="contained"
              onClick={() => router.push('/login')}
              sx={{ 
                bgcolor: 'grey',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Login
            </StyledButton>
          </>
        )}
      </Box>

      <IconButton
        sx={{ display: { md: 'none' }, color: '#1b3430' }}
        onClick={handleDrawerToggle}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 }
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
}
