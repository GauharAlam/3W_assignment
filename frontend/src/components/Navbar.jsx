import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import { brandGradient } from '../theme';

/** Frosted-glass top bar with brand mark, quick-post action and account menu. */
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);

  const handleLogout = () => {
    setAnchor(null);
    logout();
    navigate('/login');
  };

  const scrollToComposer = () => {
    document.getElementById('composer')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'rgba(255,255,255,.82)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(28,25,48,.08)',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ maxWidth: 1080, width: '100%', mx: 'auto', gap: 1.5 }}>
        {/* Brand */}
        <Box
          component={RouterLink}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', gap: 1.2, textDecoration: 'none', mr: 1 }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '12px',
              backgroundImage: brandGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: 20,
              boxShadow: '0 6px 16px -6px rgba(106,61,244,.6)',
            }}
          >
            O
          </Box>
          <Typography variant="h6" sx={{ color: 'text.primary', display: { xs: 'none', sm: 'block' } }}>
            Orbit
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {user ? (
          <>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={scrollToComposer}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              New post
            </Button>
            <IconButton onClick={(e) => setAnchor(e.currentTarget)} sx={{ p: 0.4 }}>
              <UserAvatar username={user.username} size={36} />
            </IconButton>
            <Menu
              anchorEl={anchor}
              open={Boolean(anchor)}
              onClose={() => setAnchor(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{ sx: { borderRadius: 3, minWidth: 220, mt: 1 } }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle1">@{user.username}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Log out</ListItemText>
              </MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button component={RouterLink} to="/login" color="inherit">
              Log in
            </Button>
            <Button component={RouterLink} to="/signup" variant="contained">
              Sign up
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
