// User routes
import express from 'express';
const router = express.Router();

router.get('/me', (req, res) => {
  res.json({ message: 'Auth middleware needed' });
});

export default router;
