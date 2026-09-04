import { useCallback, useEffect, useState } from 'react';
import { Container, Typography, Button, Box, CircularProgress, Alert } from '@mui/material';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';

const PAGE_SIZE = 10;

/**
 * Public social feed (newest first) with efficient pagination.
 * Like / comment / create update the list instantly (optimistic swap
 * with the server-returned post, rollback on failure for likes).
 */
export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [likingId, setLikingId] = useState(null);
  const [commentingId, setCommentingId] = useState(null);

  const fetchPage = useCallback(async (pageNum, append) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    setError('');
    try {
      const res = await api.get('/posts', { params: { page: pageNum, limit: PAGE_SIZE } });
      setPosts((prev) => (append ? [...prev, ...res.data.posts] : res.data.posts));
      setPage(res.data.page);
      setTotalPages(res.data.totalPages);
    } catch {
      setError('Could not load the feed. Check that the backend is running.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1, false);
  }, [fetchPage, user]);

  const handleCreate = async ({ text, imageUrl }) => {
    setCreating(true);
    try {
      const res = await api.post('/posts', { text, imageUrl });
      setPosts((prev) => [res.data.post, ...prev]); // instant prepend
    } finally {
      setCreating(false);
    }
  };

  const handleLike = async (post) => {
    if (!user || likingId) return;
    setLikingId(post.id || post._id);
    const prev = posts;
    // Optimistic toggle for instant feedback.
    setPosts((list) =>
      list.map((p) =>
        (p.id || p._id) === (post.id || post._id)
          ? {
              ...p,
              likedByMe: !p.likedByMe,
              likeCount: p.likeCount + (p.likedByMe ? -1 : 1),
              likes: p.likedByMe
                ? p.likes.filter((l) => l.username !== user.username)
                : [...p.likes, { username: user.username }],
            }
          : p
      )
    );
    try {
      const id = post.id || post._id;
      const res = await api.post(`/posts/${id}/like`);
      setPosts((list) => list.map((p) => ((p.id || p._id) === id ? res.data.post : p)));
    } catch {
      setPosts(prev); // rollback
    } finally {
      setLikingId(null);
    }
  };

  const handleComment = async (post, text) => {
    const id = post.id || post._id;
    setCommentingId(id);
    try {
      const res = await api.post(`/posts/${id}/comments`, { text });
      setPosts((list) => list.map((p) => ((p.id || p._id) === id ? res.data.post : p)));
    } finally {
      setCommentingId(null);
    }
  };

  const handleDelete = async (post) => {
    const id = post.id || post._id;
    if (!window.confirm('Delete this post?')) return;
    const prev = posts;
    setPosts((list) => list.filter((p) => (p.id || p._id) !== id));
    try {
      await api.delete(`/posts/${id}`);
    } catch {
      setPosts(prev);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3, pb: 8 }}>
      <CreatePost onCreate={handleCreate} creating={creating} />

      <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
        Social Feed
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error && posts.length === 0 ? (
        <Alert severity="error">{error}</Alert>
      ) : posts.length === 0 ? (
        <Alert severity="info">No posts yet — be the first to share something!</Alert>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard
              key={post.id || post._id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onDelete={handleDelete}
              liking={likingId === (post.id || post._id)}
              commenting={commentingId === (post.id || post._id)}
            />
          ))}
          {page < totalPages && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <Button variant="outlined" onClick={() => fetchPage(page + 1, true)} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
