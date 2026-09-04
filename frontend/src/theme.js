import { createTheme } from '@mui/material';

/** Brand gradient reused across logo, buttons and highlights. */
export const brandGradient = 'linear-gradient(135deg, #6a3df4 0%, #9b3df5 48%, #f53d9b 100%)';
export const brandSoft = 'linear-gradient(135deg, rgba(106,61,244,.12) 0%, rgba(245,61,155,.12) 100%)';

const theme = createTheme({
  palette: {
    primary: { main: '#6a3df4', dark: '#5228d8', light: '#8f6bf7', contrastText: '#ffffff' },
    secondary: { main: '#f53d9b', dark: '#c9267c', light: '#ff7cc0', contrastText: '#ffffff' },
    background: { default: '#f3f1fa', paper: '#ffffff' },
    text: { primary: '#1c1930', secondary: '#6f6a8c' },
    divider: 'rgba(28, 25, 48, 0.08)',
  },
  typography: {
    fontFamily:
      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h5: { fontWeight: 800, letterSpacing: '-0.02em' },
    h6: { fontWeight: 700, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600 },
    button: { fontWeight: 700, textTransform: 'none' },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, paddingLeft: 20, paddingRight: 20, paddingTop: 9, paddingBottom: 9 },
        containedPrimary: { backgroundImage: brandGradient },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: '1px solid rgba(28, 25, 48, 0.07)',
          boxShadow: '0 1px 2px rgba(28,25,48,.05), 0 8px 28px -12px rgba(106,61,244,.18)',
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: '#faf9fe',
          '&.Mui-focused': { backgroundColor: '#fff' },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: { root: { fontWeight: 700 } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiTab: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 700 } },
    },
  },
});

export default theme;
