import { Router, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications - List user's notifications
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        return res.json(notifications);
    } catch (error) {
        console.error('Get notifications error:', error);
        return res.status(500).json({ error: 'Failed to get notifications' });
    }
});

// PATCH /api/notifications/:id/read - Mark as read
router.patch('/:id/read', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.notification.update({
            where: { id: req.params.id, userId: req.userId },
            data: { read: true },
        });

        return res.json({ success: true });
    } catch (error) {
        console.error('Mark read error:', error);
        return res.status(500).json({ error: 'Failed to mark as read' });
    }
});

// PATCH /api/notifications/read-all - Mark all as read
router.patch('/read-all', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.userId, read: false },
            data: { read: true },
        });

        return res.json({ success: true });
    } catch (error) {
        console.error('Mark all read error:', error);
        return res.status(500).json({ error: 'Failed to mark all as read' });
    }
});

export default router;
