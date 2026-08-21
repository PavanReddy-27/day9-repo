import { createTheme } from '@mui/material/styles';

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#3b6978',
    },
    secondary: {
      main: '#d37c76',
    },
    success: {
      main: '#5b9279',
    },
    warning: {
      main: '#c99b5b',
    },
    error: {
      main: '#b35c5c',
    },
    info: {
      main: '#537f96',
    },
  },
  typography: {
    fontFamily: 'var(--sans)',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    }
  },
  shape: {
    borderRadius: 8,
  }
});
