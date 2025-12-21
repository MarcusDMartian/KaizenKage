import { Router, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { deductPoints, getUserBalance } from '../lib/gamification.js';
import { PointSource } from '@prisma/client';

const router = Router();

// GET /api/rewards - List rewards
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const rewards = await prisma.reward.findMany({
            where: { isActive: true },
            orderBy: { pointsCost: 'asc' },
        });

        return res.json(
            rewards.map((reward) => ({
                id: reward.id,
                name: reward.name,
                description: reward.description,
                image: reward.imageUrl || 'https://images.unsplash.com/photo-1557821552-17105176677c?w=300',
                cost: reward.pointsCost,
                type: reward.type,
                stock: reward.stock,
            }))
        );
    } catch (error) {
        console.error('Get rewards error:', error);
        return res.status(500).json({ error: 'Failed to get rewards' });
    }
});

// POST /api/rewards/:id/redeem - Redeem reward
router.post('/:id/redeem', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const rewardId = req.params.id;
        const userId = req.userId!;

        const reward = await prisma.reward.findUnique({
            where: { id: rewardId },
        });

        if (!reward) {
            return res.status(404).json({ error: 'Reward not found' });
        }

        if (reward.stock <= 0) {
            return res.status(400).json({ error: 'Reward out of stock' });
        }

        const balance = await getUserBalance(userId);
        if (balance < reward.pointsCost) {
            return res.status(400).json({ error: 'Insufficient points' });
        }

        // Create redemption request
        const redemption = await prisma.redemptionRequest.create({
            data: {
                userId,
                rewardId,
            },
            include: { reward: true },
        });

        // Deduct points
        await deductPoints(userId, reward.pointsCost, PointSource.REDEEM, redemption.id);

        // Decrease stock
        await prisma.reward.update({
            where: { id: rewardId },
            data: { stock: { decrement: 1 } },
        });

        return res.status(201).json({
            id: redemption.id,
            rewardId: reward.id,
            rewardName: reward.name,
            rewardImage: reward.imageUrl,
            pointsCost: reward.pointsCost,
            status: redemption.status.toLowerCase(),
            requestedAt: redemption.requestedAt.toISOString(),
        });
    } catch (error) {
        console.error('Redeem error:', error);
        return res.status(500).json({ error: 'Failed to redeem' });
    }
});

// GET /api/redemptions - Get user's redemption history
router.get('/redemptions', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const redemptions = await prisma.redemptionRequest.findMany({
            where: { userId: req.userId },
            include: { reward: true },
            orderBy: { requestedAt: 'desc' },
        });

        return res.json(
            redemptions.map((r) => ({
                id: r.id,
                rewardId: r.rewardId,
                rewardName: r.reward.name,
                rewardImage: r.reward.imageUrl,
                pointsCost: r.reward.pointsCost,
                status: r.status.toLowerCase(),
                requestedAt: r.requestedAt.toISOString(),
                processedAt: r.processedAt?.toISOString(),
            }))
        );
    } catch (error) {
        console.error('Get redemptions error:', error);
        return res.status(500).json({ error: 'Failed to get redemptions' });
    }
});

// GET /api/wallet - Get user's points and transactions
router.get('/wallet', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const balance = await getUserBalance(userId);

        const transactions = await prisma.pointTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });

        return res.json({
            balance,
            transactions: transactions.map((t) => ({
                id: t.id,
                description: formatSource(t.source),
                amount: t.amount,
                type: t.type.toLowerCase(),
                date: formatTimeAgo(t.createdAt),
            })),
        });
    } catch (error) {
        console.error('Get wallet error:', error);
        return res.status(500).json({ error: 'Failed to get wallet' });
    }
});

function formatSource(source: string): string {
    const map: Record<string, string> = {
        IDEA_CREATED: 'Submitted Kaizen Idea',
        IDEA_APPROVED: 'Idea Approved',
        IDEA_IMPLEMENTED: 'Idea Implemented',
        KUDOS_SENT: 'Sent Kudos',
        KUDOS_RECEIVED: 'Received Kudos',
        MISSION_COMPLETED: 'Mission Completed',
        REDEEM: 'Reward Redeemed',
        ADMIN_ADJUST: 'Admin Adjustment',
        STREAK_BONUS: 'Streak Bonus',
    };
    return map[source] || source;
}

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

export default router;
