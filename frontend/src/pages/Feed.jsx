import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Alert,
  Tabs,
  Tab,
  InputAdornment,
  TextField,
  Skeleton,
  Snackbar,
  Card,
  CardContent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import { greeting } from '../utils/format';

const PAGE_SIZE = 10;

/**
 * Social feed: greeting header, search + sort, composer, post list with
 * skeleton loading, friendly empty/error states and a desktop side rail.
 * Likes/comments update instantly (optimistic swap, rollback on failure).
 */
export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [likingId, setLikingId] = useState(null);
  const [commentingId, setCommentingId] = useState(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('latest');
  const [toast, setToast] = useState('');
  const notify = (msg) => setToast(msg);

  const fetchPage = useCallback(async (pageNum, append) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    setError('');
    try {
      const res = await api.get('/posts', { params: { page: pageNum, limit: PAGE_SIZE } });
      setPosts((prev) => (append ? [...prev, ...res.data.posts] : res.data.posts));
      setPage(res.data.page);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch {
      setError('Could not load the feed. Make sure the backend is running, then try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1, false);
  }, [fetchPage, user]);

  // Client-side search across loaded posts + sort toggle.
  const visiblePosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? posts.filter(
          (p) =>
            p.text?.toLowerCase().includes(q) || p.authorUsername?.toLowerCase().includes(q)
        )
      : [...posts];
    if (sort === 'top') filtered.sort((a, b) => b.likeCount - a.likeCount);
    return filtered;
  }, [posts, query, sort]);

  const handleCreate = async ({ text, imageUrl }) => {
    setCreating(true);
    try {
      const res = await api.post('/posts', { text, imageUrl });
      setPosts((prev) => [res.data.post, ...prev]); // instant prepend
      setTotal((t) => t + 1);
      setQuery('');
    } catch (err) {
      notify(err?.response?.data?.message || 'Could not publish your post.');
      throw err;
    } finally {
      setCreating(false);
    }
  };

  const handleLike = async (post) => {
    if (!user || likingId) return;
    const key = post.id || post._id;
    setLikingId(key);
    const prev = posts;
    // Optimistic toggle for instant feedback.
    setPosts((list) =>
      list.map((p) =>
        (p.id || p._id) === key
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
      const res = await api.post(`/posts/${key}/like`);
      setPosts((list) => list.map((p) => ((p.id || p._id) === key ? res.data.post : p)));
    } catch (err) {
      setPosts(prev); // rollback
      throw err;
    } finally {
      setLikingId(null);
    }
  };

  const handleComment = async (post, text) => {
    const key = post.id || post._id;
    setCommentingId(key);
    try {
      const res = await api.post(`/posts/${key}/comments`, { text });
      setPosts((list) => list.map((p) => ((p.id || p._id) === key ? res.data.post : p)));
    } catch (err) {
      throw err;
    } finally {
      setCommentingId(null);
    }
  };

  const handleDelete = async (post) => {
    const key = post.id || post._id;
    const prev = posts;
    setPosts((list) => list.filter((p) => (p.id || p._id) !== key));
    try {
      await api.delete(`/posts/${key}`);
      setTotal((t) => Math.max(0, t - 1));
      notify('Post deleted.');
    } catch (err) {
      setPosts(prev);
      throw err;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3, pb: { xs: 12, md: 8 } }}>
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', justifyContent: 'center' }}>
        {/* Main column */}
        <Box sx={{ width: '100%', maxWidth: 640, minWidth: 0 }}>
          <Box sx={{ mb: 2.5, px: 0.5 }} className="animate-fade-up">
            <Typography variant="h5">{greeting(user?.username)}</Typography>
            <Typography variant="body2" color="text.secondary">
              {total === 0 ? 'Be the first to share something today.' : `${total} ${total === 1 ? 'post' : 'posts'} from the community.`}
            </Typography>
          </Box>

          <CreatePost onCreate={handleCreate} creating={creating} />

          {/* Search + sort toolbar */}
          <Card sx={{ mb: 2.5, py: 1, px: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search posts or people…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{ flexGrow: 1, minWidth: 180 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Tabs value={sort} onChange={(e, v) => setSort(v)} sx={{ minHeight: 40 }}>
                <Tab value="latest" label="Latest" sx={{ minHeight: 40 }} />
                <Tab value="top" label="Most liked" sx={{ minHeight: 40 }} />
              </Tabs>
            </Box>
          </Card>

          {loading ? (
            <LoadingSkeletons />
          ) : error && posts.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant="h6" gutterBottom>
                  Feed unavailable
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  {error}
                </Typography>
                <Button variant="contained" startIcon={<RefreshIcon />} onClick={() => fetchPage(1, false)}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : visiblePosts.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    backgroundImage: 'linear-gradient(135deg, rgba(106,61,244,.12), rgba(245,61,155,.12))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    color: 'primary.main',
                  }}
                >
                  <ForumOutlinedIcon fontSize="large" />
                </Box>
                <Typography variant="h6" gutterBottom>
                  {query ? 'No matches found' : 'Nothing here yet'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {query
                    ? `Nothing matches "${query}". Try a different search.`
                    : 'Be the first to share something with the community.'}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <>
              {visiblePosts.map((post) => (
                <PostCard
                  key={post.id || post._id}
                  post={post}
                  onLike={handleLike}
                  onComment={handleComment}
                  onDelete={handleDelete}
                  liking={likingId === (post.id || post._id)}
                  commenting={commentingId === (post.id || post._id)}
                  notify={notify}
                />
              ))}
              {!query && sort === 'latest' && page < totalPages && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                  <Button variant="outlined" size="large" onClick={() => fetchPage(page + 1, true)} disabled={loadingMore}>
                    {loadingMore ? 'Loading…' : 'Load more posts'}
                  </Button>
                </Box>
              )}
              {!query && sort === 'latest' && page >= totalPages && posts.length > 3 && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 3, color: 'text.secondary' }}>
                  <CheckCircleOutlineIcon fontSize="small" />
                  <Typography variant="body2">You&apos;re all caught up</Typography>
                </Box>
              )}
            </>
          )}
        </Box>

        {/* Side rail (desktop only) */}
        <Box sx={{ width: 320, flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
          <Sidebar posts={posts} total={total} />
        </Box>
      </Box>

      {error && posts.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Alert severity="warning">{error}</Alert>
        </Box>
      )}

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3500}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
}

/** Shimmer placeholders while the first page loads. */
function LoadingSkeletons() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {[0, 1].map((i) => (
        <Card key={i} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
            <Skeleton variant="circular" width={44} height={44} />
            <Box sx={{ flexGrow: 1 }}>
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="25%" />
            </Box>
          </Box>
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="rounded" height={220} sx={{ mt: 1.5, borderRadius: 4 }} />
        </Card>
      ))}
    </Box>
  );
}
