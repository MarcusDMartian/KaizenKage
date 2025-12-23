import { Router, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authMiddleware, checkRole, AuthRequest } from '../middleware/auth.js';
import { Role } from '@prisma/client';

const router = Router();

// Protect all routes in this router with superadmin role
router.use(authMiddleware, checkRole([Role.SUPERADMIN]));

// ============================================
// USER MANAGEMENT
// ============================================

// GET /api/admin/users
router.get('/users', async (req: AuthRequest, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                team: true,
                _count: {
                    select: {
                        ideasCreated: true,
                        kudosSent: true,
                        kudosReceived: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return res.json(users);
    } catch (error) {
        console.error('Admin get users error:', error);
        return res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// PATCH /api/admin/users/:id
router.patch('/users/:id', async (req: AuthRequest, res: Response) => {
    try {
        const { role, teamId, isActive, position } = req.body;
        const updatedUser = await prisma.user.update({
            where: { id: req.params.id },
            data: { role, teamId, isActive, position }
        });
        return res.json(updatedUser);
    } catch (error) {
        console.error('Admin update user error:', error);
        return res.status(500).json({ error: 'Failed to update user' });
    }
});

// ============================================
// CONTENT MANAGEMENT (MISSIONS)
// ============================================

// GET /api/admin/missions
router.get('/missions', async (req: AuthRequest, res: Response) => {
    try {
        const missions = await prisma.mission.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return res.json(missions);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch missions' });
    }
});

// POST /api/admin/missions
router.post('/missions', async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, triggerType, rewardPoints, isActive, rulesJson } = req.body;
        const mission = await prisma.mission.create({
            data: { name, description, triggerType, rewardPoints, isActive, rulesJson }
        });
        return res.status(201).json(mission);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create mission' });
    }
});

// PATCH /api/admin/missions/:id
router.patch('/missions/:id', async (req: AuthRequest, res: Response) => {
    try {
        const mission = await prisma.mission.update({
            where: { id: req.params.id },
            data: req.body
        });
        return res.json(mission);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update mission' });
    }
});

// DELETE /api/admin/missions/:id
router.delete('/missions/:id', async (req: AuthRequest, res: Response) => {
    try {
        await prisma.mission.delete({ where: { id: req.params.id } });
        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete mission' });
    }
});

// ============================================
// CONTENT MANAGEMENT (REWARDS)
// ============================================

// GET /api/admin/rewards
router.get('/rewards', async (req: AuthRequest, res: Response) => {
    try {
        const rewards = await prisma.reward.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return res.json(rewards);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch rewards' });
    }
});

// POST /api/admin/rewards
router.post('/rewards', async (req: AuthRequest, res: Response) => {
    try {
        const reward = await prisma.reward.create({
            data: req.body
        });
        return res.status(201).json(reward);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create reward' });
    }
});

// PATCH /api/admin/rewards/:id
router.patch('/rewards/:id', async (req: AuthRequest, res: Response) => {
    try {
        const reward = await prisma.reward.update({
            where: { id: req.params.id },
            data: req.body
        });
        return res.json(reward);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update reward' });
    }
});

// DELETE /api/admin/rewards/:id
router.delete('/rewards/:id', async (req: AuthRequest, res: Response) => {
    try {
        await prisma.reward.delete({ where: { id: req.params.id } });
        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete reward' });
    }
});

// ============================================
// SYSTEM STATS
// ============================================

router.get('/stats', async (req: AuthRequest, res: Response) => {
    try {
        const [userCount, ideaCount, kudosCount, activeMissions] = await Promise.all([
            prisma.user.count(),
            prisma.kaizenIdea.count(),
            prisma.kudos.count(),
            prisma.mission.count({ where: { isActive: true } })
        ]);

        return res.json({
            userCount,
            ideaCount,
            kudosCount,
            activeMissions
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// ============================================
// JOIN REQUESTS
// ============================================

// GET /api/admin/join-requests
router.get('/join-requests', async (req: AuthRequest, res: Response) => {
    try {
        // In a real multi-tenant system, filter by admin's organization
        // For now, assuming Global Superadmin or we can add org filter if req.user has it.
        // Let's rely on global list for now or filter if we can.
        // Since we didn't strictly add organizationId to AuthRequest interface yet, 
        // we might access it if we cast or fetch.
        // But let's just fetch all for now, or filter if we query user.

        // Let's assume the admin can see all requests if they are superadmin. 
        // Or better:
        const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
        if (!user?.organizationId) {
            return res.json([]); // No org, no requests
        }

        const requests = await prisma.joinRequest.findMany({
            where: {
                orgId: user.organizationId,
                status: 'PENDING'
            },
            orderBy: { createdAt: 'desc' },
            include: { organization: true }
        });
        return res.json(requests);
    } catch (error) {
        console.error('Fetch join requests error:', error);
        return res.status(500).json({ error: 'Failed to fetch join requests' });
    }
});

// POST /api/admin/join-requests/:id/approve
router.post('/join-requests/:id/approve', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const result = await prisma.$transaction(async (prisma) => {
            const request = await prisma.joinRequest.findUnique({ where: { id } });
            if (!request || request.status !== 'PENDING') {
                throw new Error('Request not found or already processed');
            }

            // Create User
            const newUser = await prisma.user.create({
                data: {
                    email: request.email,
                    name: request.name,
                    passwordHash: request.passwordHash,
                    organizationId: request.orgId,
                    role: 'MEMBER', // Default role
                    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(request.name)}`
                }
            });

            // Update Request
            await prisma.joinRequest.update({
                where: { id },
                data: { status: 'APPROVED' }
            });

            return newUser;
        });

        return res.json({ message: 'Request approved', user: result });

    } catch (error: any) {
        console.error('Approve request error:', error);
        return res.status(500).json({ error: error.message || 'Failed to approve request' });
    }
});

// POST /api/admin/join-requests/:id/reject
router.post('/join-requests/:id/reject', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.joinRequest.update({
            where: { id },
            data: { status: 'REJECTED' }
        });

        return res.json({ message: 'Request rejected' });

    } catch (error) {
        console.error('Reject request error:', error);
        return res.status(500).json({ error: 'Failed to reject request' });
    }
});

export default router;
