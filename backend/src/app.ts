import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import ideaRoutes from './routes/ideas.js';
import kudosRoutes from './routes/kudos.js';
import rewardRoutes from './routes/rewards.js';
import missionRoutes from './routes/missions.js';
import leaderboardRoutes from './routes/leaderboard.js';
import badgeRoutes from './routes/badges.js';
import notificationRoutes from './routes/notifications.js';
import userRoutes from './routes/users.js';
import organizationRoutes from './routes/organizations.js';
import { authMiddleware } from './middleware/auth.js';

const app = express();

app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Protected routes
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/ideas', authMiddleware, ideaRoutes);
app.use('/api/kudos', authMiddleware, kudosRoutes);
app.use('/api/rewards', authMiddleware, rewardRoutes);
app.use('/api/missions', authMiddleware, missionRoutes);
app.use('/api/leaderboard', authMiddleware, leaderboardRoutes);
app.use('/api/badges', authMiddleware, badgeRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/organizations', authMiddleware, organizationRoutes);

// Fallback for 404
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

export default app;
