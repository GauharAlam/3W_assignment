import { Card, CardContent, Typography, Box, Divider, AvatarGroup, Tooltip } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import ImageIcon from '@mui/icons-material/Image';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import { brandSoft } from '../theme';
import { compactCount } from '../utils/format';

/** Aggregate the most active authors from the loaded posts. */
function topContributors(posts, limit = 5) {
  const counts = new Map();
  posts.forEach((p) => {
    const name = p.authorUsername || 'unknown';
    counts.set(name, (counts.get(name) || 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

/**
 * Right-hand rail on desktop: profile summary, how-it-works,
 * live community stats and top contributors.
 */
export default function Sidebar({ posts, total }) {
  const { user } = useAuth();
  const likes = posts.reduce((sum, p) => sum + (p.likeCount || 0), 0);
  const comments = posts.reduce((sum, p) => sum + (p.commentCount || 0), 0);
  const contributors = topContributors(posts);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'sticky', top: 88 }}>
      {/* Profile / welcome */}
      <Card>
        <CardContent>
          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <UserAvatar username={user.username} size={48} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" noWrap>
                  @{user.username}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user.email}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>
                Join the conversation
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create an account to post, like and comment on the feed.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box
                  component={RouterLink}
                  to="/signup"
                  sx={{
                    flex: 1,
                    textAlign: 'center',
                    textDecoration: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14,
                    py: 1.2,
                    borderRadius: 999,
                    backgroundImage: 'linear-gradient(135deg,#6a3df4,#f53d9b)',
                  }}
                >
                  Sign up free
                </Box>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Live stats */}
      <Card sx={{ backgroundImage: brandSoft }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <AutoAwesomeIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1">Community pulse</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2.5 }}>
            <Stat value={compactCount(total)} label="Posts" />
            <Stat value={compactCount(likes)} label="Likes" />
            <Stat value={compactCount(comments)} label="Comments" />
          </Box>
        </CardContent>
      </Card>

      {/* Top contributors */}
      {contributors.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Top contributors
            </Typography>
            <AvatarGroup
              max={6}
              sx={{ justifyContent: 'flex-end', mb: 1.5, '& .MuiAvatar-root': { border: '2px solid #fff' } }}
            >
              {contributors.map(([name]) => (
                <Tooltip key={name} title={`@${name}`}>
                  <span>
                    <UserAvatar username={name} size={34} />
                  </span>
                </Tooltip>
              ))}
            </AvatarGroup>
            {contributors.map(([name, count]) => (
              <Box
                key={name}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.2, py: 0.7 }}
              >
                <UserAvatar username={name} size={28} />
                <Typography variant="body2" sx={{ flexGrow: 1 }} noWrap>
                  @{name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {count} {count === 1 ? 'post' : 'posts'}
                </Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* How it works */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            How it works
          </Typography>
          {[
            { icon: <AddStep>1</AddStep>, text: 'Share text, a photo — or both' },
            { icon: <FavoriteIcon color="secondary" fontSize="small" />, text: 'Like posts you enjoy' },
            { icon: <ChatBubbleIcon color="primary" fontSize="small" />, text: 'Join in via comments' },
          ].map((row, i) => (
            <Box key={i}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                {row.icon}
                <Typography variant="body2">{row.text}</Typography>
              </Box>
              {i < 2 && <Divider />}
            </Box>
          ))}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, color: 'text.secondary' }}>
            <ImageIcon fontSize="small" />
            <Typography variant="caption">Images up to 5MB are welcome</Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

function Stat({ value, label }) {
  return (
    <Box>
      <Typography variant="h6">{value}</Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

function AddStep({ children }) {
  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        backgroundImage: 'linear-gradient(135deg,#6a3df4,#f53d9b)',
        color: '#fff',
        fontSize: 12,
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {children}
    </Box>
  );
}
