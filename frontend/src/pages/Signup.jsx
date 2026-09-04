import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      setError(err?.response?.data?.message || 'Signup failed. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Create an account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Join the feed — post text, photos, likes and comments.
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              inputProps={{ minLength: 3, maxLength: 30 }}
              helperText="Shown on your posts, likes and comments."
            />
            <TextField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              inputProps={{ minLength: 6 }}
              helperText="At least 6 characters."
            />
            <Button type="submit" variant="contained" size="large" disabled={busy}>
              {busy ? 'Creating…' : 'Sign up'}
            </Button>
          </Box>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Already have an account? <RouterLink to="/login">Login</RouterLink>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
