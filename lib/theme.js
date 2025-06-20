import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#818cf8' : '#6366f1',
      light: mode === 'dark' ? '#312e81' : '#dce8f3',
      dark: mode === 'dark' ? '#4f46e5' : '#4338ca',
    },
    secondary: {
      main: mode === 'dark' ? '#10b981' : '#059669',
      light: mode === 'dark' ? '#065f46' : '#d1fae5',
      dark: mode === 'dark' ? '#047857' : '#047857',
    },
    background: {
      default: mode === 'dark' ? '#0f172a' : '#ffffff',
      paper: mode === 'dark' ? '#1e293b' : '#ffffff',
    },
    text: {
      primary: mode === 'dark' ? '#f1f5f9' : '#121416',
      secondary: mode === 'dark' ? '#94a3b8' : '#6a7681',
    },
    divider: mode === 'dark' ? '#334155' : '#f1f2f4',
    error: {
      main: mode === 'dark' ? '#ef4444' : '#dc2626',
    },
    warning: {
      main: mode === 'dark' ? '#f59e0b' : '#d97706',
    },
    success: {
      main: mode === 'dark' ? '#10b981' : '#059669',
    },
    info: {
      main: mode === 'dark' ? '#3b82f6' : '#2563eb',
    },
  },
  typography: {
    fontFamily: 'Manrope, "Noto Sans", sans-serif',
    h2: {
      fontSize: '2.5rem',
      '@media (min-width:480px)': {
        fontSize: '3rem',
      },
    },
    h3: {
      fontSize: '2rem',
      '@media (min-width:480px)': {
        fontSize: '2.5rem',
      },
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 700,
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 700,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'dark' ? '0 4px 6px -1px rgb(0 0 0 / 0.3)' : 'none',
          backgroundColor: mode === 'dark' ? '#1e293b' : '#ffffff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? '#0f172a' : '#ffffff',
          boxShadow: mode === 'dark' ? '0 1px 3px 0 rgb(0 0 0 / 0.3)' : 'none',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
  },
});

export default getTheme('light');