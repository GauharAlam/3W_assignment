const { Router } = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const { requireAuth } = require('../middleware/auth');

const router = Router();

// Accept a single image upload in memory (max 5MB) and store it as a
// data-URL on the post, so no third collection / file store is needed.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

/** Is the value a usable image reference (http URL or data-URL)? */
function isImageRef(value) {
  if (!value || typeof value !== 'string') return false;
  const v = value.trim();
  return v.startsWith('http://') || v.startsWith('https://') || v.startsWith('data:image/');
}

/** Serialize a post with counts + `likedByMe` for the current viewer. */
function serializePost(post, viewerId) {
  const obj = post.toJSON({ virtuals: true });
  obj.id = post._id.toString();
  obj.likeCount = post.likes.length;
  obj.commentCount = post.comments.length;
  obj.likedByMe = viewerId ? post.likes.some((l) => l.user.toString() === viewerId) : false;
  return obj;
}

/** Extract viewer id from an optional Authorization header (feed is public). */
function optionalViewerId(req) {
  // Like/comment state is computed client-side when logged in, but parsing
  // here lets anonymous users read the feed too.
  return req.viewerId || null;
}

// If a valid token is present, remember the viewer (feed stays public).
router.use((req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme === 'Bearer' && token) {
    try {
      // eslint-disable-next-line global-require
      const jwt = require('jsonwebtoken');
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
      req.viewerId = payload.id;
    } catch {
      // Invalid token → treat as anonymous for GET feed.
    }
  }
  next();
});

// GET /api/posts?page=1&limit=10 — public feed, newest first, paginated.
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const [total, posts] = await Promise.all([
      Post.countDocuments(),
      Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    const viewerId = optionalViewerId(req);
    res.json({
      posts: posts.map((p) => serializePost(p, viewerId)),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/posts — create a post (auth). Needs text and/or image.
router.post('/', requireAuth, upload.single('image'), async (req, res, next) => {
  try {
    // Support both JSON { text, imageUrl } and multipart form { text, image file }.
    const text = (req.body.text || '').trim();
    let imageUrl = (req.body.imageUrl || '').trim();

    if (req.file) {
      imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    if (!text && !isImageRef(imageUrl)) {
      return res.status(400).json({ message: 'Post needs text or an image (either one is enough)' });
    }
    if (text.length > 2000) return res.status(400).json({ message: 'Post must be at most 2000 characters' });

    const post = await Post.create({
      author: req.user.id,
      authorUsername: req.user.username,
      text,
      imageUrl: isImageRef(imageUrl) ? imageUrl.trim() : '',
    });
    res.status(201).json({ post: serializePost(post, req.user.id) });
  } catch (err) {
    next(err);
  }
});

// POST /api/posts/:id/like — toggle like (auth). Returns updated post.
router.post('/:id/like', requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const idx = post.likes.findIndex((l) => l.user.toString() === req.user.id);
    let liked;
    if (idx >= 0) {
      post.likes.splice(idx, 1); // unlike
      liked = false;
    } else {
      post.likes.push({ user: req.user.id, username: req.user.username });
      liked = true;
    }
    await post.save();
    res.json({ post: serializePost(post, req.user.id), liked });
  } catch (err) {
    next(err);
  }
});

// POST /api/posts/:id/comments — add a comment (auth). Returns updated post.
router.post(
  '/:id/comments',
  requireAuth,
  [body('text').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be 1–500 characters')],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: 'Post not found' });

      post.comments.push({ user: req.user.id, username: req.user.username, text: req.body.text.trim() });
      await post.save();
      res.status(201).json({ post: serializePost(post, req.user.id) });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/posts/:id — owner can delete their own post (auth).
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
