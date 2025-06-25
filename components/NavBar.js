'use client';

import { useState } from "react";
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
  AppBar,
  Toolbar,
  Container,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Image from "next/image";
import NotificationBell from './NotificationBell';

export default function NavBar() {
  const { user, logout } = useAuth();
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
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        TaskMaster
      </Typography>
      <List>
        {user ? (
          <>
            {navItems.map((item) => (
              <ListItem key={item.label} disablePadding>
                <Button fullWidth onClick={() => router.push(item.path)} sx={{ justifyContent: 'flex-start', color: 'text.primary', bgcolor: pathname === item.path ? 'action.selected' : 'transparent' }}>
                  <ListItemText primary={item.label} />
                </Button>
              </ListItem>
            ))}
            <ListItem disablePadding>
              <Button fullWidth onClick={() => router.push('/profile')} sx={{ justifyContent: 'flex-start', color: 'text.primary', bgcolor: pathname === '/profile' ? 'action.selected' : 'transparent' }}>
                <ListItemText primary={`Profile (${user?.name || "User"})`} />
              </Button>
            </ListItem>
             <ListItem disablePadding>
               <Button fullWidth onClick={handleLogout} sx={{ justifyContent: 'flex-start', color: 'text.primary' }}>
                 <ListItemText primary="Logout" />
               </Button>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <Button fullWidth onClick={() => router.push("/signup")} sx={{ justifyContent: 'flex-start', color: 'text.primary' }}>
                <ListItemText primary="Sign Up" />
              </Button>
            </ListItem>
            <ListItem disablePadding>
              <Button fullWidth onClick={() => router.push("/login")} sx={{ justifyContent: 'flex-start', color: 'text.primary' }}>
                <ListItemText primary="Login" />
              </Button>
            </ListItem>
          </>
        )}
         <ListItem>
            <IconButton onClick={toggleTheme} sx={{ m: 'auto', color: 'text.primary' }}>
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', flexGrow: 1 }} onClick={() => router.push('/')}>
            <Image src="/logo.png" alt="Logo" width={32} height={32} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              TaskMaster
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
            {user ? (
              <>
                {navItems.map((item) => (
                  <Button
                    key={item.label}
                    onClick={() => router.push(item.path)}
                    sx={{ color: 'text.primary', fontWeight: pathname === item.path ? 'bold' : 'normal' }}
                  >
                    {item.label}
                  </Button>
                ))}
                <Button onClick={() => router.push('/profile')} sx={{ color: 'text.primary' }}>
                  {user?.name || "User"}
                </Button>
                <NotificationBell />
                <IconButton onClick={toggleTheme} color="inherit">
                  {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
                <Button variant="outlined" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="contained" onClick={() => router.push('/signup')}>
                  Sign Up
                </Button>
                <Button onClick={() => router.push('/login')}>
                  Login
                </Button>
              </>
            )}
          </Box>

          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
            {user && <NotificationBell />}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        anchor="right"
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 }
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
}