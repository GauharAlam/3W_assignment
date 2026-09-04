const jwt = require('jsonwebtoken');
const User = require('../models/User');

/** Create a signed JWT for a user document. */
function signToken(user) {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: user._id.toString(), username: user.username }, secret, { expiresIn });
}

/** Shape returned to the client (never includes passwordHash). */
function publicUser(user) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  };
}

/**
 * Auth middleware. Expects `Authorization: Bearer <token>`.
 * Attaches `req.user = { id, username }` and the full doc as `req.userDoc`.
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const payload = jwt.verify(token, secret);
    const userDoc = await User.findById(payload.id);
    if (!userDoc) return res.status(401).json({ message: 'Account no longer exists' });
    req.user = { id: userDoc._id.toString(), username: userDoc.username };
    req.userDoc = userDoc;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = { signToken, publicUser, requireAuth };
