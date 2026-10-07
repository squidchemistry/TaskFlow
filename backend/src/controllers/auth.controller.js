const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { sign } = require('../utils/jwt');

const formatUser = (u) => ({
  id: u.id,
  full_name: u.fullName,
  email: u.email,
  avatar_url: u.avatarUrl ?? null,
  has_password: !!u.passwordHash,
  has_google: !!u.googleId,
  created_at: u.createdAt,
});

// Cached dummy hash prevents timing-based user enumeration
let _dummyHash = null;
const getDummyHash = async () => {
  if (!_dummyHash) _dummyHash = await bcrypt.hash('__dummy_constant_time__', 12);
  return _dummyHash;
};

const register = async (req, res, next) => {
  try {
    const { full_name, email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { fullName: full_name, email, passwordHash } });
    const token = sign({ sub: user.id });
    res.status(201).json({ user: formatUser(user), token });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    const hashToCompare = user?.passwordHash ?? (await getDummyHash());
    const valid = await bcrypt.compare(password, hashToCompare);

    if (!user || !valid) return res.status(401).json({ error: 'Invalid credentials' });

    // Account exists but was created via Google — no local password set
    if (!user.passwordHash) {
      return res.status(401).json({ error: 'This account uses Google Sign-In. Please log in with Google.' });
    }

    const token = sign({ sub: user.id });
    res.json({ user: formatUser(user), token });
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => res.json({ message: 'Logged out successfully' });

const me = (req, res) => res.json(formatUser(req.user));

const updateMe = async (req, res, next) => {
  try {
    const { full_name, current_password, new_password } = req.body;
    const user = req.user;
    const updates = {};

    if (full_name) updates.fullName = full_name;

    if (new_password) {
      if (!user.passwordHash) {
        return res.status(400).json({ error: 'Google accounts cannot set a password this way' });
      }
      const valid = await bcrypt.compare(current_password, user.passwordHash);
      if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
      updates.passwordHash = await bcrypt.hash(new_password, 12);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const updated = await prisma.user.update({ where: { id: user.id }, data: updates });
    res.json({ user: formatUser(updated) });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, me, updateMe };
