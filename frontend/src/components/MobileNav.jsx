import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LoginIcon from '@mui/icons-material/Login';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * TaskPlanet-style bottom tab bar for phones.
 * Home scrolls to top, New post jumps to the composer.
 */
export default function MobileNav() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const goHome = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const goComposer = () =>
    document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        display: { xs: 'block', md: 'none' },
        borderRadius: '20px 20px 0 0',
        overflow: 'hidden',
      }}
    >
      <BottomNavigation showLabels sx={{ height: 64 }}>
        <BottomNavigationAction label="Home" icon={<HomeIcon />} onClick={goHome} />
        {user ? (
          <BottomNavigationAction label="New post" icon={<AddCircleIcon />} onClick={goComposer} />
        ) : (
          <BottomNavigationAction label="Sign in" icon={<LoginIcon />} onClick={() => navigate('/login')} />
        )}
      </BottomNavigation>
    </Paper>
  );
}
