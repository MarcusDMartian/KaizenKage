import prisma from './prisma.js';
import { PointSource, TransactionType } from '@prisma/client';

// Points awarded for different actions
export const POINTS = {
    IDEA_CREATED: 50,
    IDEA_APPROVED: 100,
    IDEA_IMPLEMENTED: 200,
    KUDOS_SENT: 10,
    KUDOS_RECEIVED: 20,
    MISSION_COMPLETED: 25,
};

// Add points to user
export async function awardPoints(
    userId: string,
    amount: number,
    source: PointSource,
    referenceId?: string
) {
    return prisma.pointTransaction.create({
        data: {
            userId,
            amount,
            type: TransactionType.EARN,
            source,
            referenceId,
        },
    });
}

// Deduct points from user
export async function deductPoints(
    userId: string,
    amount: number,
    source: PointSource,
    referenceId?: string
) {
    return prisma.pointTransaction.create({
        data: {
            userId,
            amount: -amount,
            type: TransactionType.SPEND,
            source,
            referenceId,
        },
    });
}

// Get user's total points balance
export async function getUserBalance(userId: string): Promise<number> {
    const result = await prisma.pointTransaction.aggregate({
        where: { userId },
        _sum: { amount: true },
    });
    return result._sum.amount || 0;
}

// Get user's level based on points
export function getUserLevel(points: number): number {
    if (points >= 5000) return 10;
    if (points >= 4000) return 9;
    if (points >= 3000) return 8;
    if (points >= 2500) return 7;
    if (points >= 2000) return 6;
    if (points >= 1500) return 5;
    if (points >= 1000) return 4;
    if (points >= 500) return 3;
    if (points >= 200) return 2;
    return 1;
}

// Get points needed for next level
export function getNextLevelPoints(level: number): number {
    const thresholds = [0, 200, 500, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 10000];
    return thresholds[Math.min(level, 10)];
}
