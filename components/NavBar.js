"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useGlobalLoader } from "../context/GlobalLoaderContext"; // Import the hook
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
import NotificationBell from "./NotificationBell";

export default function NavBar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mode, toggleTheme } = useTheme();
  const { setIsLoading } = useGlobalLoader(); // Use the loader context

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Wrapper for navigation to set loading state
  const handleNavigation = (path) => {
    if (pathname !== path) {
      setIsLoading(true);
    }
    router.push(path);
  };

  const handleLogout = () => {
    setIsLoading(true);
    logout();
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Tasks", path: "/tasks" },
    { label: "Teams", path: "/teams" },
    { label: "Activity Log", path: "/activity-log" },
  ];

  if (user?.role === "admin" || user?.role === "manager") {
    navItems.splice(3, 0, { label: "Users", path: "/users" });
  }

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center", p: 2 }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        TaskMaster
      </Typography>
      <List>
        {user ? (
          <>
            {navItems.map((item) => (
              <ListItem key={item.label} disablePadding>
                <Button
                  fullWidth
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    justifyContent: "flex-start",
                    color: "text.primary",
                    bgcolor:
                      pathname === item.path
                        ? "action.selected"
                        : "transparent",
                  }}
                >
                  <ListItemText primary={item.label} />
                </Button>
              </ListItem>
            ))}
            <ListItem disablePadding>
              <Button
                fullWidth
                onClick={() => handleNavigation("/profile")}
                sx={{
                  justifyContent: "flex-start",
                  color: "text.primary",
                  bgcolor:
                    pathname === "/profile" ? "action.selected" : "transparent",
                }}
              >
                <ListItemText primary={`Profile (${user?.name || "User"})`} />
              </Button>
            </ListItem>
            <ListItem disablePadding>
              <Button
                fullWidth
                onClick={handleLogout}
                sx={{ justifyContent: "flex-start", color: "text.primary" }}
              >
                <ListItemText primary="Logout" />
              </Button>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <Button
                fullWidth
                onClick={() => handleNavigation("/signup")}
                sx={{ justifyContent: "flex-start", color: "text.primary" }}
              >
                <ListItemText primary="Sign Up" />
              </Button>
            </ListItem>
            <ListItem disablePadding>
              <Button
                fullWidth
                onClick={() => handleNavigation("/login")}
                sx={{ justifyContent: "flex-start", color: "text.primary" }}
              >
                <ListItemText primary="Login" />
              </Button>
            </ListItem>
          </>
        )}
        <ListItem>
          <IconButton
            onClick={toggleTheme}
            sx={{ m: "auto", color: "text.primary" }}
          >
            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar
      position="fixed"
      color="transparent"
      elevation={0}
      sx={(theme) => ({
        borderBottom: 1,
        borderColor: "divider",
        top: 0,
        zIndex: 1200,
        mb: 10,
        backdropFilter: "blur(8px)",
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(33, 33, 33, 0.7)"
            : "rgba(255, 255, 255, 0.7)",
      })}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              flexGrow: 1,
            }}
            onClick={() => handleNavigation("/")}
          >
            <Image src="/logo.png" alt="Logo" width={32} height={32} />
            <Typography
              variant="h6"
              component="div"
              sx={{ fontWeight: "bold" }}
            >
              TaskMaster
            </Typography>
          </Box>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 1,
              alignItems: "center",
            }}
          >
            {user ? (
              <>
                {navItems.map((item) => (
                  <Button
                    key={item.label}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      color: "text.primary",
                      color:
                        pathname === item.path
                          ? "primary.main"
                          : "text.primary",
                      fontWeight: pathname === item.path ? "bold" : "normal",
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
                <Button
                  onClick={() => handleNavigation("/profile")}
                  sx={{
                    color: "text.primary",
                    color:
                      pathname === "/profile" ? "primary.main" : "text.primary",
                    fontWeight: pathname === "/profile" ? "bold" : "normal",
                  }}
                >
                  {user?.name || "User"}
                </Button>
                <NotificationBell />
                <IconButton onClick={toggleTheme} color="inherit">
                  {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
                <Button variant="outlined" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  onClick={() => handleNavigation("/signup")}
                >
                  Sign Up
                </Button>
                <Button onClick={() => handleNavigation("/login")}>
                  Login
                </Button>
              </>
            )}
          </Box>

          <Box
            sx={{ display: { xs: "flex", md: "none" }, alignItems: "center" }}
          >
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
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
}
