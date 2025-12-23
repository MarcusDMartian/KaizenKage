import { Router, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { getUserBalance, getUserLevel } from '../lib/gamification.js';

const router = Router();

// GET /api/leaderboard
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { period = 'month', team } = req.query;

        // Get date range based on period
        const now = new Date();
        let startDate = new Date();

        if (period === 'week') {
            startDate.setDate(now.getDate() - 7);
        } else if (period === 'month') {
            startDate.setMonth(now.getMonth() - 1);
        } else if (period === 'quarter') {
            startDate.setMonth(now.getMonth() - 3);
        } else {
            startDate = new Date(0); // All time
        }

        // Get users with their points in the period
        const users = await prisma.user.findMany({
            where: {
                isActive: true,
                ...(team ? { team: { name: team as string } } : {}),
            },
            include: {
                team: true,
                pointTransactions: {
                    where: {
                        createdAt: { gte: startDate },
                        amount: { gt: 0 },
                    },
                },
            },
        });

        // Calculate period points and sort
        const leaderboard = users
            .map((user) => {
                const periodPoints = user.pointTransactions.reduce((sum, t) => sum + t.amount, 0);
                return {
                    id: user.id,
                    name: user.name,
                    avatar: user.avatarUrl,
                    team: user.team?.name || 'Engineering',
                    points: periodPoints,
                    level: getUserLevel(periodPoints),
                    badges: [], // TODO: Include actual badges
                };
            })
            .sort((a, b) => b.points - a.points)
            .map((user, index) => ({
                ...user,
                rank: index + 1,
                change: Math.floor(Math.random() * 5) - 2, // TODO: Calculate actual change
            }));

        return res.json(leaderboard);
    } catch (error) {
        console.error('Get leaderboard error:', error);
        return res.status(500).json({ error: 'Failed to get leaderboard' });
    }
});

export default router;
