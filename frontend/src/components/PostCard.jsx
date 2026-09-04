import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  Typography,
  IconButton,
  Box,
  AvatarGroup,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogContent,
  Button,
  Collapse,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SendIcon from '@mui/icons-material/Send';
import LoginIcon from '@mui/icons-material/Login';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import { timeAgo, compactCount } from '../utils/format';

const PREVIEW_COMMENTS = 2;

/**
 * A single feed post: gradient identity header, rich media with lightbox,
 * animated like pill, avatar-stack social proof and bubble comments.
 */
export default function PostCard({ post, onLike, onComment, onDelete, liking, commenting, notify }) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const id = post.id || post._id;
  const isOwner = user && (user.id === post.author || user.username === post.authorUsername);
  const comments = post.comments || [];
  const likes = post.likes || [];
  const visibleComments = commentsOpen ? comments : comments.slice(-PREVIEW_COMMENTS);
  const hiddenCount = comments.length - visibleComments.length;

  const submitComment = async (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text || commenting) return;
    try {
      await onComment(post, text);
      setCommentText('');
      setCommentsOpen(true);
    } catch {
      notify?.('Could not post your comment. Try again.');
    }
  };

  const handleLike = async () => {
    try {
      await onLike(post);
    } catch {
      notify?.('Could not update your like. Try again.');
    }
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    setMenuAnchor(null);
    try {
      await onDelete(post);
    } catch {
      notify?.('Could not delete the post. Try again.');
    }
  };

  return (
    <Card className="animate-fade-up" sx={{ mb: 2.5, overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, pt: 2, pb: post.text ? 1 : 2 }}>
        <UserAvatar username={post.authorUsername} size={44} />
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" noWrap>
            @{post.authorUsername}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {timeAgo(post.createdAt)}
          </Typography>
        </Box>
        {isOwner && (
          <>
            <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="Post options">
              <MoreHorizIcon />
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              PaperProps={{ sx: { borderRadius: 3 } }}
            >
              <MenuItem onClick={() => setConfirmDelete(true)} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <DeleteOutlineIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Delete post</ListItemText>
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>

      {/* Body */}
      {post.text && (
        <Typography variant="body1" sx={{ px: 2, pb: post.imageUrl ? 1.5 : 0.5, whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>
          {post.text}
        </Typography>
      )}
      {post.imageUrl && (
        <Box sx={{ px: post.text ? 2 : 0, pb: 1, pt: post.text ? 0 : 0 }}>
          <Box
            onClick={() => setLightbox(true)}
            sx={{
              borderRadius: post.text ? '16px' : 0,
              overflow: 'hidden',
              cursor: 'zoom-in',
              border: post.text ? '1px solid rgba(28,25,48,.08)' : 'none',
              '& img': { transition: 'transform .4s ease', display: 'block' },
              '&:hover img': { transform: 'scale(1.02)' },
            }}
          >
            <img
              src={post.imageUrl}
              alt={`Post by @${post.authorUsername}`}
              loading="lazy"
              style={{ width: '100%', maxHeight: 520, objectFit: 'cover' }}
            />
          </Box>
        </Box>
      )}

      {/* Social proof */}
      {(post.likeCount > 0 || post.commentCount > 0) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, pt: 1 }}>
          {likes.length > 0 && (
            <AvatarGroup
              max={4}
              sx={{ '& .MuiAvatar-root': { width: 22, height: 22, fontSize: 9, border: '2px solid #fff' } }}
            >
              {likes.map((l) => (
                <Tooltip key={`${l.username}-${l.user}`} title={`@${l.username}`}>
                  <span>
                    <UserAvatar username={l.username} size={22} />
                  </span>
                </Tooltip>
              ))}
            </AvatarGroup>
          )}
          <Typography variant="caption" color="text.secondary">
            {post.likeCount > 0 && `${compactCount(post.likeCount)} ${post.likeCount === 1 ? 'like' : 'likes'}`}
            {post.likeCount > 0 && post.commentCount > 0 && '  ·  '}
            {post.commentCount > 0 &&
              `${compactCount(post.commentCount)} ${post.commentCount === 1 ? 'comment' : 'comments'}`}
          </Typography>
        </Box>
      )}

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 1, px: 2, py: 1.5 }}>
        <ActionPill
          active={post.likedByMe}
          activeColor="#f53d9b"
          onClick={handleLike}
          disabled={!user || liking}
          label={compactCount(post.likeCount || 0)}
          title={user ? (post.likedByMe ? 'Unlike' : 'Like') : 'Log in to like'}
          icon={
            <span key={String(post.likedByMe)} className={post.likedByMe ? 'like-pop' : ''} style={{ display: 'flex' }}>
              {post.likedByMe ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
            </span>
          }
        />
        <ActionPill
          active={commentsOpen}
          onClick={() => setCommentsOpen((s) => !s)}
          label={compactCount(post.commentCount || 0)}
          title={commentsOpen ? 'Hide comments' : 'Show comments'}
          icon={<ChatBubbleOutlineIcon fontSize="small" />}
        />
      </Box>

      {/* Comments */}
      <Collapse in={commentsOpen || comments.length > 0}>
        <Box sx={{ px: 2, pb: 1 }}>
          {!commentsOpen && hiddenCount > 0 && (
            <Button size="small" onClick={() => setCommentsOpen(true)} sx={{ px: 1, mb: 0.5, color: 'text.secondary' }}>
              View all {comments.length} comments
            </Button>
          )}
          <Box className="nice-scroll" sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, maxHeight: 320, overflowY: 'auto', py: 0.5 }}>
            {visibleComments.map((c) => (
              <Box key={c._id || `${c.username}-${c.createdAt}`} sx={{ display: 'flex', gap: 1 }}>
                <UserAvatar username={c.username} size={28} />
                <Box
                  sx={{
                    backgroundColor: '#f4f2fb',
                    borderRadius: '4px 16px 16px 16px',
                    px: 1.5,
                    py: 1,
                    flexGrow: 1,
                    minWidth: 0,
                  }}
                >
                  <Typography variant="caption" fontWeight={700}>
                    @{c.username}
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1, fontWeight: 400 }}>
                      {timeAgo(c.createdAt)}
                    </Typography>
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {c.text}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Collapse>

      {/* Comment input / guest nudge */}
      <Box sx={{ px: 2, pb: 2, pt: 0.5 }}>
        {user ? (
          <Box component="form" onSubmit={submitComment} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <UserAvatar username={user.username} size={32} />
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f4f2fb',
                borderRadius: 999,
                pl: 2,
                pr: 0.5,
                py: 0.4,
                border: '1.5px solid transparent',
                transition: 'border-color .2s ease',
                '&:focus-within': { borderColor: 'primary.main', backgroundColor: '#fff' },
              }}
            >
              <input
                placeholder="Write a comment…"
                value={commentText}
                maxLength={500}
                onChange={(e) => setCommentText(e.target.value)}
                style={{
                  flexGrow: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  font: 'inherit',
                  fontSize: 14,
                  minWidth: 0,
                }}
              />
              <IconButton
                type="submit"
                size="small"
                disabled={!commentText.trim() || commenting}
                sx={{
                  backgroundImage: 'linear-gradient(135deg,#6a3df4,#f53d9b)',
                  color: '#fff',
                  '&:hover': { opacity: 0.9 },
                  '&.Mui-disabled': { backgroundImage: 'none', backgroundColor: 'rgba(28,25,48,.08)' },
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Button
            component={RouterLink}
            to="/login"
            fullWidth
            startIcon={<LoginIcon />}
            sx={{
              backgroundColor: '#f4f2fb',
              color: 'text.secondary',
              justifyContent: 'center',
              '&:hover': { backgroundColor: '#ede9fa' },
            }}
          >
            Log in to like and join the conversation
          </Button>
        )}
      </Box>

      {/* Image lightbox */}
      <Dialog open={lightbox} onClose={() => setLightbox(false)} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 1, backgroundColor: '#0f0a23' }}>
          <img src={post.imageUrl} alt="" style={{ width: '100%', borderRadius: 8, display: 'block' }} />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="xs" fullWidth>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Delete this post?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            This will permanently remove your post, its likes and comments.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button onClick={() => setConfirmDelete(false)} color="inherit">
              Keep it
            </Button>
            <Button onClick={handleDelete} variant="contained" color="error">
              Delete
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Card>
  );
}

/** Rounded pill action button used for like / comment. */
function ActionPill({ icon, label, onClick, disabled, active, activeColor = '#6a3df4', title }) {
  return (
    <Tooltip title={title || ''}>
      <span>
        <Button
          onClick={onClick}
          disabled={disabled}
          startIcon={icon}
          sx={{
            borderRadius: 999,
            px: 2,
            py: 0.7,
            minWidth: 0,
            backgroundColor: active ? `${activeColor}14` : '#f4f2fb',
            color: active ? activeColor : 'text.secondary',
            '&:hover': { backgroundColor: active ? `${activeColor}22` : '#ede9fa' },
          }}
        >
          {label}
        </Button>
      </span>
    </Tooltip>
  );
}
