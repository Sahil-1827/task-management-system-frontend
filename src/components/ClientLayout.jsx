import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import NavBar from "./NavBar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useLocation } from 'react-router-dom';
import { useGlobalLoader } from "../context/GlobalLoaderContext";
import GlobalLoader from "./GlobalLoader";
import { Box, AppBar, Toolbar, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const drawerWidth = 280;

export default function ClientLayout({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { isLoading: navIsLoading, setIsLoading: setNavIsLoading } = useGlobalLoader();
  const location = useLocation();
  const pathname = location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  useEffect(() => {
    if (navIsLoading) {
      setNavIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isAppLoading = authLoading || navIsLoading;
  // Pages where we don't show any nav (Login/Signup)
  const isLoginPage = pathname === "/login" || pathname === "/signup";

  // Authenticated state: Show Sidebar
  // We use Sidebar if user is logged in
  const showSidebar = !isLoginPage && !authLoading && user;

  // Public state: Show NavBar (Landing page, etc)
  const showNavBar = !isLoginPage && !authLoading && !user;

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: showSidebar ? 'row' : 'column',
      minHeight: '100vh',
      bgcolor: 'var(--background)'
    }}>
      {isAppLoading && <GlobalLoader />}

      {/* Sidebar for Authenticated Users */}
      {showSidebar && (
        <>
          <Box
            component="nav"
            sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
          >
            <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
          </Box>

          {/* Mobile Header for Toggle */}
          <AppBar
            position="fixed"

            elevation={0}
            sx={{
              width: { lg: `calc(100% - ${drawerWidth}px)` },
              ml: { lg: `${drawerWidth}px` },
              display: { lg: 'none' },
              bgcolor: 'background.default',
              color: 'text.primary',
              borderBottom: '1px solid',
              borderColor: 'divider',
              backdropFilter: 'blur(8px)',
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)'
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
                Task Management System
              </Typography>
            </Toolbar>
          </AppBar>
        </>
      )}

      {/* Navbar for Unauthenticated Users */}
      {showNavBar && (
        <NavBar />
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: showSidebar ? { xs: 2, sm: 4 } : 0,
          width: showSidebar ? { lg: `calc(100% - ${drawerWidth}px)` } : '100%',
          mt: (showNavBar || (showSidebar && !isDesktop)) ? '64px' : 0,

          filter: navIsLoading ? 'blur(4px)' : 'none',
          visibility: authLoading ? 'hidden' : 'visible',
          transition: 'filter 0.2s linear',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {children}
      </Box>

      {showNavBar && <Footer />}
    </Box>
  );
}
