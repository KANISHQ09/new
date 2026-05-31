// Auth routes — Register / Login
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = express.Router();

// In-memory user store for demo (replace with Supabase in production)
const users = new Map();

const RegisterSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const JWT_SECRET = process.env.JWT_SECRET || 'hammer-glory-secret-dev';

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = RegisterSchema.parse(req.body);
    
    if ([...users.values()].find((u) => u.email === email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    if ([...users.values()].find((u) => u.username === username)) {
      return res.status(409).json({ error: 'Username taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: `user_${Date.now()}`,
      username,
      email,
      password: hashedPassword,
      balance: 5000,
      totalWins: 0,
      totalSpent: 0,
      reputationScore: 100,
      createdAt: new Date(),
    };
    users.set(user.id, user);

    const token = signToken(user.id);
    const { password: _, ...safeUser } = user;
    return res.status(201).json({ user: safeUser, token });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const user = [...users.values()].find((u) => u.email === email);
    
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = signToken(user.id);
    const { password: _, ...safeUser } = user;
    return res.json({ user: safeUser, token });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors[0].message });
    }
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
