import prisma from './prisma.js';

export async function createNotification(userId: string, data: {
    type: string;
    title: string;
    message: string;
    link?: string;
}) {
    try {
        await prisma.notification.create({
            data: {
                userId,
                ...data,
            },
        });
    } catch (error) {
        console.error('Create notification error:', error);
    }
}
