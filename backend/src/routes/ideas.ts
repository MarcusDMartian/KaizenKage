import { Router, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { awardPoints, POINTS } from '../lib/gamification.js';
import { PointSource } from '@prisma/client';

const router = Router();

// GET /api/ideas - List ideas
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { status, team, sort = 'latest' } = req.query;

        const ideas = await prisma.kaizenIdea.findMany({
            where: {
                ...(status ? { status: status as any } : {}),
                ...(team ? { team: { name: team as string } } : {}),
            },
            include: {
                creator: true,
                team: true,
                votes: true,
                comments: {
                    include: { user: true },
                    orderBy: { createdAt: 'desc' },
                },
            },
            orderBy: sort === 'votes'
                ? { votes: { _count: 'desc' } }
                : { createdAt: 'desc' },
        });

        return res.json(
            ideas.map((idea) => ({
                id: idea.id,
                title: idea.title,
                problem: idea.problemText,
                proposal: idea.proposalText,
                impact: idea.impactType.toLowerCase(),
                status: idea.status.toLowerCase().replace('_', '-'),
                votes: idea.votes.length,
                votedBy: idea.votes.map((v) => v.voterId),
                comments: idea.comments.map((c) => ({
                    id: c.id,
                    userId: c.userId,
                    userName: c.user.name,
                    userAvatar: c.user.avatarUrl,
                    text: c.commentText,
                    createdAt: c.createdAt.toISOString(),
                })),
                author: {
                    id: idea.creator.id,
                    name: idea.creator.name,
                    avatar: idea.creator.avatarUrl,
                    team: idea.team?.name || 'Engineering',
                },
                createdAt: formatTimeAgo(idea.createdAt),
            }))
        );
    } catch (error) {
        console.error('Get ideas error:', error);
        return res.status(500).json({ error: 'Failed to get ideas' });
    }
});

// GET /api/ideas/:id - Get single idea
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const idea = await prisma.kaizenIdea.findUnique({
            where: { id: req.params.id },
            include: {
                creator: true,
                team: true,
                votes: true,
                comments: {
                    include: { user: true },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!idea) {
            return res.status(404).json({ error: 'Idea not found' });
        }

        return res.json({
            id: idea.id,
            title: idea.title,
            problem: idea.problemText,
            proposal: idea.proposalText,
            impact: idea.impactType.toLowerCase(),
            status: idea.status.toLowerCase().replace('_', '-'),
            votes: idea.votes.length,
            votedBy: idea.votes.map((v) => v.voterId),
            comments: idea.comments.map((c) => ({
                id: c.id,
                userId: c.userId,
                userName: c.user.name,
                userAvatar: c.user.avatarUrl,
                text: c.commentText,
                createdAt: c.createdAt.toISOString(),
            })),
            author: {
                id: idea.creator.id,
                name: idea.creator.name,
                avatar: idea.creator.avatarUrl,
                team: idea.team?.name || 'Engineering',
            },
            createdAt: formatTimeAgo(idea.createdAt),
        });
    } catch (error) {
        console.error('Get idea error:', error);
        return res.status(500).json({ error: 'Failed to get idea' });
    }
});

// POST /api/ideas - Create idea
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { title, problem, proposal, impact } = req.body;

        if (!title || !problem || !proposal) {
            return res.status(400).json({ error: 'Title, problem, and proposal are required' });
        }

        const idea = await prisma.kaizenIdea.create({
            data: {
                creatorId: req.userId!,
                title,
                problemText: problem,
                proposalText: proposal,
                impactType: (impact?.toUpperCase() || 'OTHER') as any,
            },
            include: {
                creator: true,
                votes: true,
                comments: true,
            },
        });

        // Award points for creating idea
        await awardPoints(req.userId!, POINTS.IDEA_CREATED, PointSource.IDEA_CREATED, idea.id);

        return res.status(201).json({
            id: idea.id,
            title: idea.title,
            problem: idea.problemText,
            proposal: idea.proposalText,
            impact: idea.impactType.toLowerCase(),
            status: idea.status.toLowerCase(),
            votes: 0,
            votedBy: [],
            comments: [],
            author: {
                id: idea.creator.id,
                name: idea.creator.name,
                avatar: idea.creator.avatarUrl,
            },
            createdAt: 'Just now',
        });
    } catch (error) {
        console.error('Create idea error:', error);
        return res.status(500).json({ error: 'Failed to create idea' });
    }
});

// POST /api/ideas/:id/vote - Toggle vote
router.post('/:id/vote', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const ideaId = req.params.id;
        const voterId = req.userId!;

        // Check if already voted
        const existingVote = await prisma.kaizenVote.findUnique({
            where: {
                ideaId_voterId: { ideaId, voterId },
            },
        });

        if (existingVote) {
            // Remove vote
            await prisma.kaizenVote.delete({
                where: { id: existingVote.id },
            });
            return res.json({ voted: false });
        } else {
            // Add vote
            await prisma.kaizenVote.create({
                data: { ideaId, voterId },
            });
            return res.json({ voted: true });
        }
    } catch (error) {
        console.error('Vote error:', error);
        return res.status(500).json({ error: 'Failed to vote' });
    }
});

// POST /api/ideas/:id/comments - Add comment
router.post('/:id/comments', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Comment text is required' });
        }

        const comment = await prisma.kaizenComment.create({
            data: {
                ideaId: req.params.id,
                userId: req.userId!,
                commentText: text,
            },
            include: { user: true },
        });

        return res.status(201).json({
            id: comment.id,
            userId: comment.userId,
            userName: comment.user.name,
            userAvatar: comment.user.avatarUrl,
            text: comment.commentText,
            createdAt: comment.createdAt.toISOString(),
        });
    } catch (error) {
        console.error('Add comment error:', error);
        return res.status(500).json({ error: 'Failed to add comment' });
    }
});

// Helper function
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
