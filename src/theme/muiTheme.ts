import { createTheme } from '@mui/material/styles';

export const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0096C7', // Rich vibrant cerulean/teal
      light: '#48CAE4',
      dark: '#023E8A',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF7E67', // Glowing coral/rose
      light: '#FFA696',
      dark: '#D84C3F',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10B981', // Glowing emerald
      light: '#34D399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#F59E0B', // Glowing gold
      light: '#FBBF24',
      dark: '#D97706',
      contrastText: '#ffffff',
    },
    error: {
      main: '#EF4444', // Glowing ruby
      light: '#F87171',
      dark: '#DC2626',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0EA5E9', // Glowing sky blue
      light: '#38BDF8',
      dark: '#0284C7',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: 'var(--sans)',
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.3px',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
      color: '#0F172A',
    },
    h6: {
      fontWeight: 600,
      color: '#1E293B',
    },
  },
  shape: {
    borderRadius: 12, // Slightly rounder for a premium feel
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'all 0.3s ease',
          '&.MuiButton-containedPrimary': {
            boxShadow: '0 4px 14px 0 rgba(0, 150, 199, 0.39)', // Primary glow
            '&:hover': {
              boxShadow: '0 6px 20px rgba(0, 150, 199, 0.5)',
              transform: 'translateY(-1px)',
            }
          },
          '&.MuiButton-containedSecondary': {
            boxShadow: '0 4px 14px 0 rgba(255, 126, 103, 0.39)', // Secondary glow
            '&:hover': {
              boxShadow: '0 6px 20px rgba(255, 126, 103, 0.5)',
              transform: 'translateY(-1px)',
            }
          },
          '&.MuiButton-containedError': {
            boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.39)', // Error glow
            '&:hover': {
              boxShadow: '0 6px 20px rgba(239, 68, 68, 0.5)',
              transform: 'translateY(-1px)',
            }
          },
          '&.MuiButton-containedSuccess': {
            boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)', // Success glow
            '&:hover': {
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.5)',
              transform: 'translateY(-1px)',
            }
          }
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
            backgroundColor: 'rgba(0, 150, 199, 0.04)',
          }
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.02)', // Soft, luxurious float
          border: '1px solid rgba(226, 232, 240, 0.8)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08), 0 8px 16px -8px rgba(0, 150, 199, 0.1)',
            transform: 'translateY(-2px)',
          }
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
        colorSuccess: {
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          color: '#059669',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        },
        colorWarning: {
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          color: '#D97706',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        },
        colorError: {
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: '#DC2626',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        },
        colorInfo: {
          backgroundColor: 'rgba(14, 165, 233, 0.15)',
          color: '#0284C7',
          border: '1px solid rgba(14, 165, 233, 0.3)',
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            transition: 'box-shadow 0.2s ease',
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(0, 150, 199, 0.2)', // Focus glow
            }
          }
        }
      }
    }
  },
});
