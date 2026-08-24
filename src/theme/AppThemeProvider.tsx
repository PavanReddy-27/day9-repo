import { useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, ThemeOptions } from '@mui/material/styles';
import { useTheme } from '../context/useTheme';

const themeOptions: ThemeOptions = {
  palette: {
    primary: { main: '#3b6978' },
    secondary: { main: '#d37c76' },
    success: { main: '#5b9279' },
    warning: { main: '#c99b5b' },
    error: { main: '#b35c5c' },
    info: { main: '#537f96' },
  },
  typography: {
    fontFamily: 'var(--sans)',
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
};

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();

  const dynamicMuiTheme = useMemo(() => {
    return createTheme({
      ...themeOptions,
      palette: {
        ...themeOptions.palette,
        mode: theme,
      },
    });
  }, [theme]);

  return <MuiThemeProvider theme={dynamicMuiTheme}>{children}</MuiThemeProvider>;
};
