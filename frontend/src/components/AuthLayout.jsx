import { Container, Card, Box, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import ImageIcon from '@mui/icons-material/Image';
import { brandGradient } from '../theme';

/**
 * Split auth layout: brand panel (gradient, feature bullets) + form panel.
 * Stacks vertically on phones.
 */
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 6 }, pb: { xs: 12, md: 6 } }}>
      <Card className="animate-fade-up" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, overflow: 'hidden' }}>
        {/* Brand panel */}
        <Box
          sx={{
            flex: 1,
            backgroundImage: brandGradient,
            color: '#fff',
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 2.5,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* soft decorative circles */}
          <Box sx={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,.12)', top: -70, right: -70 }} />
          <Box sx={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,.1)', bottom: -50, left: -40 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, position: 'relative' }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '13px',
                background: 'rgba(255,255,255,.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 22,
              }}
            >
              O
            </Box>
            <Typography variant="h6" sx={{ color: '#fff' }}>
              Orbit
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ position: 'relative', lineHeight: 1.3 }}>
            Your community, one feed.
          </Typography>
          {[
            { icon: <ImageIcon fontSize="small" />, text: 'Post text and photos in seconds' },
            { icon: <FavoriteIcon fontSize="small" />, text: 'Like what the community shares' },
            { icon: <ChatBubbleIcon fontSize="small" />, text: 'Discuss everything in comments' },
          ].map((row, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative', opacity: 0.95 }}>
              {row.icon}
              <Typography variant="body2">{row.text}</Typography>
            </Box>
          ))}
        </Box>

        {/* Form panel */}
        <Box sx={{ flex: 1.1, p: { xs: 3, sm: 4 } }}>
          <Typography variant="h5" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {subtitle}
          </Typography>
          {children}
        </Box>
      </Card>
    </Container>
  );
}
