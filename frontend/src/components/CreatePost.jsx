import { useRef, useState } from 'react';
import { Card, CardContent, TextField, Button, Box, Typography, Avatar } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import { useAuth } from '../context/AuthContext';

/**
 * Composer for a new post — text and/or image (either one is enough).
 * Images are previewed locally and sent as base64 data-URLs (max ~5MB).
 */
export default function CreatePost({ onCreate, creating }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  if (!user) return null;

  const handleFile = (file) => {
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result.toString());
    reader.onerror = () => setError('Could not read that image.');
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!text.trim() && !imageDataUrl) {
      setError('Write something or add an image — either one is enough.');
      return;
    }
    try {
      await onCreate({ text: text.trim(), imageUrl: imageDataUrl });
      setText('');
      setImageDataUrl('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not create post.');
    }
  };

  return (
    <Card sx={{ mb: 2, borderRadius: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>{user.username?.[0]?.toUpperCase()}</Avatar>
          <Box component="form" onSubmit={handleSubmit} sx={{ flexGrow: 1 }}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              placeholder={`What's on your mind, ${user.username}?`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              inputProps={{ maxLength: 2000 }}
            />
            {imageDataUrl && (
              <Box sx={{ position: 'relative', mt: 1 }}>
                <img
                  src={imageDataUrl}
                  alt="Upload preview"
                  style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 12 }}
                />
                <IconButton
                  size="small"
                  onClick={() => setImageDataUrl('')}
                  sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff' }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
            {error && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <Button
                startIcon={<ImageIcon />}
                onClick={() => fileRef.current?.click()}
                color="inherit"
              >
                Photo
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <Button type="submit" variant="contained" disabled={creating || (!text.trim() && !imageDataUrl)}>
                {creating ? 'Posting…' : 'Post'}
              </Button>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
