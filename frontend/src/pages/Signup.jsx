import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Typography, TextField, Button, Box, Alert, InputAdornment, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signup(username.trim(), email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Signup failed. Try a different email.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Pick a username — it appears on your posts, likes and comments.">
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Username"
          required
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          inputProps={{ minLength: 3, maxLength: 30 }}
          helperText="3–30 characters, shown publicly."
        />
        <TextField
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type={showPw ? 'text' : 'password'}
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          inputProps={{ minLength: 6 }}
          helperText="At least 6 characters."
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setShowPw((s) => !s)} edge="end" aria-label="Toggle password visibility">
                  {showPw ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button type="submit" variant="contained" size="large" disabled={busy} sx={{ mt: 0.5 }}>
          {busy ? 'Creating…' : 'Sign up free'}
        </Button>
      </Box>
      <Typography variant="body2" sx={{ mt: 2.5, textAlign: 'center' }} color="text.secondary">
        Already have an account?{' '}
        <RouterLink to="/login" style={{ color: '#6a3df4', fontWeight: 700 }}>
          Log in
        </RouterLink>
      </Typography>
    </AuthLayout>
  );
}
