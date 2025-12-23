import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import ideasRoutes from './routes/ideas.js';
import kudosRoutes from './routes/kudos.js';
import rewardsRoutes from './routes/rewards.js';
import missionsRoutes from './routes/missions.js';
import leaderboardRoutes from './routes/leaderboard.js';
import badgesRoutes from './routes/badges.js';
import notificationsRoutes from './routes/notifications.js';

const app = express();
const PORT = process.env.PORT || 8000;

// CORS configuration for production
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:4173',
    'https://marcusdmartian.github.io',
    process.env.FRONTEND_URL
].filter((origin): origin is string => Boolean(origin));

const corsOptions = {
    origin: allowedOrigins,
    credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/me', usersRoutes);
app.use('/api/ideas', ideasRoutes);
app.use('/api/kudos', kudosRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/missions', missionsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/badges', badgesRoutes);
app.use('/api/notifications', notificationsRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 KaizenHub API running at http://localhost:${PORT}`);
    console.log(`📚 API docs: http://localhost:${PORT}/api/health`);
});

export default app;
