import { Router, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/organizations/:id/roles - Get available roles for an organization
router.get('/:id/roles', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const roles = await prisma.orgRole.findMany({
            where: { organizationId: id },
            orderBy: { name: 'asc' }
        });
        return res.json(roles);
    } catch (error) {
        console.error('Get org roles error:', error);
        return res.status(500).json({ error: 'Failed to fetch roles for organization' });
    }
});

export default router;
