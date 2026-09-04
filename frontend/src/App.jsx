import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import theme from './theme';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import Feed from './pages/Feed';
import Login from './pages/Login';
import Signup from './pages/Signup';

/** Redirect logged-in users away from auth pages. */
function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <AuthSplash />;
  return user ? <Navigate to="/" replace /> : children;
}

/** Brief branded splash while the session is rehydrated. */
function AuthSplash() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route
              path="/login"
              element={
                <GuestOnly>
                  <Login />
                </GuestOnly>
              }
            />
            <Route
              path="/signup"
              element={
                <GuestOnly>
                  <Signup />
                </GuestOnly>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <MobileNav />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
