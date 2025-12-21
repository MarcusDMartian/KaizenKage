import { Router, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/badges - Get all badges with user's unlock status
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;

        const badges = await prisma.badge.findMany({
            include: {
                userBadges: {
                    where: { userId },
                },
            },
        });

        return res.json(
            badges.map((badge) => ({
                id: badge.id,
                name: badge.name,
                icon: badge.iconUrl || '🏆',
                description: badge.description,
                unlocked: badge.userBadges.length > 0,
                awardedAt: badge.userBadges[0]?.awardedAt?.toISOString(),
            }))
        );
    } catch (error) {
        console.error('Get badges error:', error);
        return res.status(500).json({ error: 'Failed to get badges' });
    }
});

export default router;
