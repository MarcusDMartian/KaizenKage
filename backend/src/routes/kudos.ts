import { Router, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { awardPoints, POINTS } from '../lib/gamification.js';
import { PointSource } from '@prisma/client';

const router = Router();

// GET /api/kudos - List kudos
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { filter } = req.query;

        let where = {};
        if (filter === 'mine') {
            where = { receiverId: req.userId };
        }

        const kudosList = await prisma.kudos.findMany({
            where,
            include: {
                sender: true,
                receiver: true,
                likes: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return res.json(
            kudosList.map((kudos) => ({
                id: kudos.id,
                sender: {
                    id: kudos.sender.id,
                    name: kudos.sender.name,
                    avatar: kudos.sender.avatarUrl,
                },
                receiver: {
                    id: kudos.receiver.id,
                    name: kudos.receiver.name,
                    avatar: kudos.receiver.avatarUrl,
                },
                value: kudos.coreValue.toLowerCase(),
                message: kudos.message,
                likes: kudos.likes.length,
                likedBy: kudos.likes.map((l) => l.userId),
                createdAt: formatTimeAgo(kudos.createdAt),
            }))
        );
    } catch (error) {
        console.error('Get kudos error:', error);
        return res.status(500).json({ error: 'Failed to get kudos' });
    }
});

// POST /api/kudos - Send kudos
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { receiverId, value, message } = req.body;

        if (!receiverId || !value || !message) {
            return res.status(400).json({ error: 'Receiver, value, and message are required' });
        }

        if (receiverId === req.userId) {
            return res.status(400).json({ error: 'Cannot send kudos to yourself' });
        }

        const kudos = await prisma.kudos.create({
            data: {
                senderId: req.userId!,
                receiverId,
                coreValue: value.toUpperCase() as any,
                message,
            },
            include: {
                sender: true,
                receiver: true,
                likes: true,
            },
        });

        // Award points to sender and receiver
        await awardPoints(req.userId!, POINTS.KUDOS_SENT, PointSource.KUDOS_SENT, kudos.id);
        await awardPoints(receiverId, POINTS.KUDOS_RECEIVED, PointSource.KUDOS_RECEIVED, kudos.id);

        return res.status(201).json({
            id: kudos.id,
            sender: {
                id: kudos.sender.id,
                name: kudos.sender.name,
                avatar: kudos.sender.avatarUrl,
            },
            receiver: {
                id: kudos.receiver.id,
                name: kudos.receiver.name,
                avatar: kudos.receiver.avatarUrl,
            },
            value: kudos.coreValue.toLowerCase(),
            message: kudos.message,
            likes: 0,
            likedBy: [],
            createdAt: 'Just now',
        });
    } catch (error) {
        console.error('Send kudos error:', error);
        return res.status(500).json({ error: 'Failed to send kudos' });
    }
});

// POST /api/kudos/:id/like - Toggle like
router.post('/:id/like', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const kudosId = req.params.id;
        const userId = req.userId!;

        const existingLike = await prisma.kudosLike.findUnique({
            where: {
                kudosId_userId: { kudosId, userId },
            },
        });

        if (existingLike) {
            await prisma.kudosLike.delete({
                where: { id: existingLike.id },
            });
            return res.json({ liked: false });
        } else {
            await prisma.kudosLike.create({
                data: { kudosId, userId },
            });
            return res.json({ liked: true });
        }
    } catch (error) {
        console.error('Like error:', error);
        return res.status(500).json({ error: 'Failed to like' });
    }
});

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
