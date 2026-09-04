import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import ForumIcon from '@mui/icons-material/Forum';
import { useAuth } from '../context/AuthContext';

/** Top navigation bar — inspired by a simple social app header. */
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="sticky" color="primary" elevation={1}>
      <Toolbar sx={{ maxWidth: 720, width: '100%', mx: 'auto' }}>
        <ForumIcon sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none', fontWeight: 700 }}
        >
          Mini Social
        </Typography>
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              @{user.username}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
            <Button color="inherit" component={RouterLink} to="/signup">
              Sign up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
