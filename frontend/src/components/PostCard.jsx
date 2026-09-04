import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  CardActions,
  Avatar,
  Typography,
  IconButton,
  TextField,
  Button,
  Box,
  Divider,
  Tooltip,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useAuth } from '../context/AuthContext';

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

/**
 * Single post in the feed. Like + comment update instantly (optimistic UI):
 * the parent passes handlers that swap the updated post into the list.
 */
export default function PostCard({ post, onLike, onComment, onDelete, liking, commenting }) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const isOwner = user && (user.id === post.author || user.username === post.authorUsername);
  const likerNames = (post.likes || []).map((l) => l.username).join(', ');

  const submitComment = async (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    await onComment(post, text);
    setCommentText('');
    setShowComments(true);
  };

  return (
    <Card sx={{ mb: 2, borderRadius: 3 }}>
      <CardHeader
        avatar={<Avatar sx={{ bgcolor: 'primary.main' }}>{post.authorUsername?.[0]?.toUpperCase()}</Avatar>}
        title={`@${post.authorUsername}`}
        subheader={timeAgo(post.createdAt)}
        action={
          isOwner ? (
            <IconButton aria-label="delete post" onClick={() => onDelete(post)} size="small">
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          ) : null
        }
      />
      {post.text ? (
        <CardContent sx={{ pt: 0 }}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {post.text}
          </Typography>
        </CardContent>
      ) : null}
      {post.imageUrl ? (
        <CardMedia component="img" image={post.imageUrl} alt="Post attachment" sx={{ maxHeight: 480, objectFit: 'cover' }} />
      ) : null}

      <CardActions sx={{ px: 2 }}>
        <Tooltip title={likerNames || (post.likeCount ? `${post.likeCount} likes` : 'Be the first to like')}>
          <span>
            <IconButton
              aria-label="like post"
              onClick={() => onLike(post)}
              disabled={!user || liking}
              color={post.likedByMe ? 'error' : 'default'}
            >
              {post.likedByMe ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </span>
        </Tooltip>
        <Typography variant="body2" color="text.secondary">
          {post.likeCount || 0}
        </Typography>
        <IconButton aria-label="toggle comments" onClick={() => setShowComments((s) => !s)}>
          <ChatBubbleOutlineIcon />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          {post.commentCount || 0} comments
        </Typography>
      </CardActions>

      {(showComments || (post.comments && post.comments.length > 0 && post.comments.length <= 3)) && post.comments?.length > 0 && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Divider sx={{ mb: 1 }} />
          {post.comments.map((c) => (
            <Box key={c._id || `${c.username}-${c.createdAt}`} sx={{ mb: 1 }}>
              <Typography variant="body2">
                <strong>@{c.username}</strong> {c.text}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {timeAgo(c.createdAt)}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {user ? (
        <Box component="form" onSubmit={submitComment} sx={{ display: 'flex', gap: 1, p: 2, pt: 1 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Write a comment…"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            inputProps={{ maxLength: 500 }}
          />
          <Button type="submit" variant="contained" disabled={!commentText.trim() || commenting}>
            Post
          </Button>
        </Box>
      ) : (
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Login to like or comment.
          </Typography>
        </Box>
      )}
    </Card>
  );
}
