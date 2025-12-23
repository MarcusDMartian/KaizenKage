import { Router, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authMiddleware, AuthRequest, checkRole } from '../middleware/auth.js';
import { getUserBalance, getUserLevel, getNextLevelPoints } from '../lib/gamification.js';

const router = Router();

// GET /api/me - Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: {
                team: true,
                userBadges: {
                    include: { badge: true },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const points = await getUserBalance(user.id);
        const level = getUserLevel(points);
        const nextLevelPoints = getNextLevelPoints(level);

        // Calculate streak (simplified - just count consecutive days with transactions)
        const streak = 12; // TODO: Calculate actual streak

        return res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
            role: user.role,
            team: user.team?.name || 'Engineering',
            position: user.position || 'Software Engineer',
            points,
            level,
            nextLevelPoints,
            streak,
            badges: user.userBadges.map((ub) => ({
                id: ub.badge.id,
                name: ub.badge.name,
                icon: ub.badge.iconUrl || '🏆',
                color: 'bg-amber-100',
                description: ub.badge.description,
            })),
        });
    } catch (error) {
        console.error('Get me error:', error);
        return res.status(500).json({ error: 'Failed to get user' });
    }
});

// GET /api/users - List users
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { team } = req.query;

        const users = await prisma.user.findMany({
            where: team ? { team: { name: team as string } } : undefined,
            include: { team: true },
            orderBy: { name: 'asc' },
        });

        const usersWithPoints = await Promise.all(
            users.map(async (user) => {
                const points = await getUserBalance(user.id);
                return {
                    id: user.id,
                    name: user.name,
                    avatarUrl: user.avatarUrl,
                    role: user.role,
                    team: user.team?.name || 'Engineering',
                    position: user.position || 'Software Engineer',
                    points,
                    level: getUserLevel(points),
                };
            })
        );

        return res.json(usersWithPoints);
    } catch (error) {
        console.error('Get users error:', error);
        return res.status(500).json({ error: 'Failed to get users' });
    }
});

// GET /api/users/:id
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            include: { team: true },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const points = await getUserBalance(user.id);

        return res.json({
            id: user.id,
            name: user.name,
            avatarUrl: user.avatarUrl,
            role: user.role,
            team: user.team?.name || 'Engineering',
            position: user.position || 'Software Engineer',
            points,
            level: getUserLevel(points),
        });
    } catch (error) {
        console.error('Get user error:', error);
        return res.status(500).json({ error: 'Failed to get user' });
    }
});

// PATCH /api/users/:id - Update user (Admin only)
router.patch('/:id', authMiddleware, checkRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
    try {
        const { role, teamId, position, isActive } = req.body;
        const userId = req.params.id;

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(role ? { role: role.toUpperCase() as any } : {}),
                ...(teamId ? { teamId } : {}),
                ...(position ? { position } : {}),
                ...(isActive !== undefined ? { isActive } : {}),
            },
        });

        return res.json(user);
    } catch (error) {
        console.error('Update user error:', error);
        return res.status(500).json({ error: 'Failed to update user' });
    }
});

export default router;
