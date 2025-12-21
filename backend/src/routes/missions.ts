import { Router, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { awardPoints, POINTS } from '../lib/gamification.js';
import { PointSource, MissionStatus } from '@prisma/client';

const router = Router();

// GET /api/missions - Get user's missions
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get or create daily missions for user
        const missions = await prisma.mission.findMany({
            where: { isActive: true },
        });

        const userMissions = await Promise.all(
            missions.map(async (mission) => {
                let userMission = await prisma.userMission.findFirst({
                    where: {
                        userId,
                        missionId: mission.id,
                        periodStart: { gte: today },
                    },
                });

                // Create if doesn't exist
                if (!userMission) {
                    const periodEnd = new Date(today);
                    periodEnd.setDate(periodEnd.getDate() + (mission.triggerType === 'WEEKLY' ? 7 : 1));

                    userMission = await prisma.userMission.create({
                        data: {
                            userId,
                            missionId: mission.id,
                            periodStart: today,
                            periodEnd,
                        },
                    });
                }

                // Calculate target from rulesJson
                let target = 1;
                if (mission.rulesJson) {
                    try {
                        const rules = JSON.parse(mission.rulesJson);
                        target = rules.min_count || 1;
                    } catch { }
                }

                return {
                    id: mission.id,
                    userMissionId: userMission.id,
                    name: mission.name,
                    description: mission.description,
                    type: mission.triggerType.toLowerCase(),
                    progress: userMission.progressValue,
                    target,
                    reward: mission.rewardPoints,
                    status: userMission.status.toLowerCase(),
                    completed: userMission.status === 'COMPLETED' || userMission.status === 'CLAIMED',
                    claimed: userMission.status === 'CLAIMED',
                };
            })
        );

        return res.json(userMissions);
    } catch (error) {
        console.error('Get missions error:', error);
        return res.status(500).json({ error: 'Failed to get missions' });
    }
});

// POST /api/missions/:id/claim - Claim mission reward
router.post('/:id/claim', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const missionId = req.params.id;
        const userId = req.userId!;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const userMission = await prisma.userMission.findFirst({
            where: {
                userId,
                missionId,
                status: MissionStatus.COMPLETED,
                periodStart: { gte: today },
            },
            include: { mission: true },
        });

        if (!userMission) {
            return res.status(400).json({ error: 'Mission not completed or already claimed' });
        }

        // Update status to claimed
        await prisma.userMission.update({
            where: { id: userMission.id },
            data: { status: MissionStatus.CLAIMED },
        });

        // Award points
        await awardPoints(
            userId,
            userMission.mission.rewardPoints,
            PointSource.MISSION_COMPLETED,
            userMission.id
        );

        return res.json({
            success: true,
            pointsAwarded: userMission.mission.rewardPoints,
        });
    } catch (error) {
        console.error('Claim mission error:', error);
        return res.status(500).json({ error: 'Failed to claim mission' });
    }
});

// POST /api/missions/:id/progress - Update mission progress (internal use)
router.post('/:id/progress', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const missionId = req.params.id;
        const userId = req.userId!;
        const { increment = 1 } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const userMission = await prisma.userMission.findFirst({
            where: {
                userId,
                missionId,
                status: MissionStatus.ACTIVE,
                periodStart: { gte: today },
            },
            include: { mission: true },
        });

        if (!userMission) {
            return res.status(404).json({ error: 'Mission not found' });
        }

        let target = 1;
        if (userMission.mission.rulesJson) {
            try {
                const rules = JSON.parse(userMission.mission.rulesJson);
                target = rules.min_count || 1;
            } catch { }
        }

        const newProgress = userMission.progressValue + increment;
        const isCompleted = newProgress >= target;

        await prisma.userMission.update({
            where: { id: userMission.id },
            data: {
                progressValue: newProgress,
                status: isCompleted ? MissionStatus.COMPLETED : MissionStatus.ACTIVE,
            },
        });

        return res.json({
            progress: newProgress,
            target,
            completed: isCompleted,
        });
    } catch (error) {
        console.error('Update progress error:', error);
        return res.status(500).json({ error: 'Failed to update progress' });
    }
});

export default router;
