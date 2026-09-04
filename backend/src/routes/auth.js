const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { signToken, publicUser, requireAuth } = require('../middleware/auth');

const router = Router();

/** Turn express-validator errors into a 400 response. Returns true when OK. */
function checkValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    return false;
  }
  return true;
}

// POST /api/auth/signup — create account, return token + user.
router.post(
  '/signup',
  [
    body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters'),
    body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res, next) => {
    try {
      if (!checkValidation(req, res)) return;
      const { username, email, password } = req.body;

      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ message: 'Email is already registered' });

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ username, email, passwordHash });
      const token = signToken(user);
      res.status(201).json({ token, user: publicUser(user) });
    } catch (err) {
      // Handle duplicate-email race condition.
      if (err && err.code === 11000) {
        return res.status(409).json({ message: 'Email is already registered' });
      }
      next(err);
    }
  }
);

// POST /api/auth/login — verify credentials, return token + user.
router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      if (!checkValidation(req, res)) return;
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+passwordHash');
      if (!user) return res.status(401).json({ message: 'Invalid email or password' });

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

      const token = signToken(user);
      res.json({ token, user: publicUser(user) });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/auth/me — current user (requires token). Used to rehydrate session.
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.userDoc) });
});

module.exports = router;
