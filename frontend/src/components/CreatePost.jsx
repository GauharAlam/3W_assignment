import { useRef, useState } from 'react';
import {
  Card,
  CardContent,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';

const MAX_LEN = 2000;

/**
 * Post composer — guests see nothing, members get an avatar-led editor
 * with photo attachment, live character count and inline validation.
 */
export default function CreatePost({ onCreate, creating }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const fileRef = useRef(null);

  if (!user) return null;
  const expanded = focused || text.length > 0 || imageDataUrl;

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
      setError('Write something or add a photo — either one is enough.');
      return;
    }
    try {
      await onCreate({ text: text.trim(), imageUrl: imageDataUrl });
      setText('');
      setImageDataUrl('');
      setFocused(false);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not publish your post.');
    }
  };

  return (
    <Card id="composer" className="animate-fade-up" sx={{ mb: 2.5, scrollMarginTop: 90 }}>
      {creating && <LinearProgress />}
      <CardContent sx={{ pb: '16px !important' }}>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <UserAvatar username={user.username} size={44} />
          <Box component="form" onSubmit={handleSubmit} sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box
              onClick={() => setFocused(true)}
              sx={{
                borderRadius: 4,
                backgroundColor: expanded ? '#fff' : '#f4f2fb',
                border: expanded ? '1.5px solid #6a3df4' : '1.5px solid transparent',
                transition: 'all .2s ease',
                px: 2,
                py: 1.2,
                cursor: expanded ? 'text' : 'pointer',
                '&:hover': { backgroundColor: expanded ? '#fff' : '#ede9fa' },
              }}
            >
              <textarea
                rows={expanded ? 3 : 1}
                placeholder={`Share something, ${user.username}…`}
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
                onFocus={() => setFocused(true)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  background: 'transparent',
                  font: 'inherit',
                  fontSize: 15,
                  lineHeight: 1.55,
                  color: 'inherit',
                }}
              />
            </Box>

            {imageDataUrl && (
              <Box sx={{ position: 'relative', mt: 1.5 }}>
                <img
                  src={imageDataUrl}
                  alt="Upload preview"
                  style={{ width: '100%', maxHeight: 340, objectFit: 'cover', borderRadius: 16 }}
                />
                <IconButton
                  size="small"
                  onClick={() => setImageDataUrl('')}
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    bgcolor: 'rgba(15,10,35,.62)',
                    color: '#fff',
                    '&:hover': { bgcolor: 'rgba(15,10,35,.8)' },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 1.5, borderRadius: 3 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
              <Tooltip title="Add a photo (max 5MB)">
                <Button
                  startIcon={<ImageIcon />}
                  onClick={() => fileRef.current?.click()}
                  sx={{ color: 'text.secondary', px: 2 }}
                >
                  Photo
                </Button>
              </Tooltip>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <Box sx={{ flexGrow: 1 }} />
              {text.length > 0 && (
                <Typography variant="caption" color={text.length >= MAX_LEN ? 'error' : 'text.secondary'}>
                  {text.length}/{MAX_LEN}
                </Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                endIcon={<SendIcon fontSize="small" />}
                disabled={creating || (!text.trim() && !imageDataUrl)}
              >
                {creating ? 'Posting…' : 'Post'}
              </Button>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
