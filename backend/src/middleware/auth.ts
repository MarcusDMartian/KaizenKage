import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'kaizenhub-secret-key-change-in-production';

export interface AuthRequest extends Request {
    userId?: string;
    user?: any; // To store full user info if needed
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ error: 'No authorization header' });
        return;
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
        return;
    }
}

export function checkRole(roles: Role[]) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        try {
            const user = await prisma.user.findUnique({
                where: { id: req.userId },
                select: { role: true },
            });

            if (!user || !roles.includes(user.role)) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            next();
        } catch (error) {
            console.error('Check role error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}

export function generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export { JWT_SECRET };
