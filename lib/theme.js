import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => createTheme({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // palette values for light mode
          primary: {
            main: '#4f46e5',
            light: '#6366f1',
            dark: '#4338ca',
          },
          secondary: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
          },
          background: {
            default: '#f1f5f9',
            paper: '#ffffff',
          },
          text: {
            primary: '#1e293b',
            secondary: '#475569',
          },
          divider: '#e2e8f0',
        }
      : {
          // palette values for dark mode
          primary: {
            main: '#818cf8',
            light: '#a5b4fc',
            dark: '#6366f1',
          },
          secondary: {
            main: '#34d399',
            light: '#6ee7b7',
            dark: '#10b981',
          },
          background: {
            default: '#0f172a',
            paper: '#1e293b',
          },
          text: {
            primary: '#f1f5f9',
            secondary: '#94a3b8',
          },
          divider: '#334155',
        }),
  },
  typography: {
    fontFamily: '"Manrope", "Noto Sans", sans-serif',
    h2: {
      fontWeight: 900,
      fontSize: 'clamp(2rem, 5vw, 3rem)',
    },
    h3: {
      fontWeight: 700,
      fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
    },
    h4: {
      fontWeight: 700,
      fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
    },
    h6: {
      fontWeight: 700,
      fontSize: '1.125rem',
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
          borderRadius: '8px',
          fontWeight: 600,
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
        root: ({ theme }) => ({
          borderRadius: '12px',
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`,
        }),
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
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.default,
          boxShadow: 'none',
        }),
      },
    },
    MuiTableContainer: {
        styleOverrides: {
            root: {
                borderRadius: '12px',
            }
        }
    },
    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({
          backgroundColor: theme.palette.mode === 'light' ? '#f8fafc' : '#334155',
          fontWeight: 'bold',
        }),
      },
    },
  },
});

export default getTheme('light');