import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useGlobalLoader } from "../context/GlobalLoaderContext";
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Drawer,
    IconButton,
    Avatar,
    Divider,
    useMediaQuery,
    Tooltip,
} from "@mui/material";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import TaskIcon from "@mui/icons-material/Task";
import GroupIcon from "@mui/icons-material/Group";
import HistoryIcon from "@mui/icons-material/History";
import PeopleIcon from "@mui/icons-material/People";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import NotificationBell from "./NotificationBell";
import AssignmentIcon from '@mui/icons-material/Assignment';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import GroupsIcon from '@mui/icons-material/Groups';

const drawerWidth = 280;

export default function Sidebar({ mobileOpen, handleDrawerToggle }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;
    const { mode, toggleTheme } = useTheme();
    const { setIsLoading } = useGlobalLoader();
    const muiTheme = useMuiTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down("lg"));

    const handleNavigation = (path) => {
        if (pathname !== path) {
            setIsLoading(true);
        }
        navigate(path);
        if (isMobile) {
            handleDrawerToggle();
        }
    };

    const handleLogout = () => {
        setIsLoading(true);
        logout();
    };

    const navItems = [
        { label: "Dashboard", path: "/dashboard", icon: <DashboardRoundedIcon /> },
        { label: "Tasks", path: "/tasks", icon: <AssignmentIcon /> },
        { label: "Teams", path: "/teams", icon: <GroupsIcon /> },
        { label: "Activity Log", path: "/activity-log", icon: <HistoryIcon /> },
    ];

    if (user?.role === "admin" || user?.role === "manager") {
        navItems.splice(3, 0, { label: "Manage Users", path: "/users", icon: <PeopleIcon /> });
    }

    const drawerContent = (
        <Box
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                bgcolor: "background.paper", // Use theme background
                color: "text.primary",
            }}
        >
            {/* Header / Logo */}
            <Box
                sx={{
                    p: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <img src="/logo.png" alt="Logo" width={32} height={32} />
                    <Typography variant="h6" fontWeight="bold">
                        Task Management System
                    </Typography>
                </Box>
                {isMobile && (
                    <IconButton onClick={handleDrawerToggle}>
                        <CloseIcon />
                    </IconButton>
                )}
            </Box>

            <Divider />

            {/* Navigation Items */}
            <List sx={{ flexGrow: 1, px: 2, py: 2 }}>
                {navItems.map((item) => (
                    <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                            onClick={() => handleNavigation(item.path)}
                            selected={pathname === item.path}
                            sx={{
                                borderRadius: 2,
                                "&.Mui-selected": {
                                    bgcolor: "primary.main",
                                    color: "primary.contrastText",
                                    "&:hover": {
                                        bgcolor: "primary.dark",
                                    },
                                    "& .MuiListItemIcon-root": {
                                        color: "primary.contrastText",
                                    },
                                },
                                "&:hover": {
                                    bgcolor: "action.hover",
                                }
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 40,
                                    color: pathname === item.path ? "inherit" : "text.secondary",
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{ fontWeight: pathname === item.path ? "bold" : "medium" }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Divider />

            {/* Bottom Actions */}
            <Box sx={{ p: 2 }}>
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    }}
                >
                    <ListItemButton
                        onClick={() => handleNavigation("/profile")}
                        selected={pathname === "/profile"}
                        sx={{ borderRadius: 2, mb: 1, px: 1 }}
                    >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', mr: 2 }} src={user?.profilePicture}>
                                {!user?.avatar && <AccountCircleIcon fontSize="small" />}
                            </Avatar>
                        </ListItemIcon>
                        <ListItemText
                            primary={user?.name || "Profile"}
                            primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 'bold' }}
                            secondary="View Profile"
                            secondaryTypographyProps={{ variant: 'caption' }}
                        />
                    </ListItemButton>

                    <Box sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Tooltip title="Toggle Theme">
                            <IconButton onClick={toggleTheme} size="small" sx={{ color: 'text.secondary' }}>
                                {mode === "dark" ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
                            </IconButton>
                        </Tooltip>
                        <NotificationBell />
                        <Tooltip title="Logout">
                            <IconButton onClick={handleLogout} color="error" size="small">
                                <LogoutIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
        >
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: "block", lg: "none" },
                    "& .MuiDrawer-paper": {
                        boxSizing: "border-box",
                        width: drawerWidth,
                        borderRight: "1px solid",
                        borderColor: "divider",
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: "none", lg: "block" },
                    "& .MuiDrawer-paper": {
                        boxSizing: "border-box",
                        width: drawerWidth,
                        borderRight: "1px solid",
                        borderColor: "divider",
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
}
