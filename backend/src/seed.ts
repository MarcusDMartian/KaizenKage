import prisma from './lib/prisma.js';
import bcrypt from 'bcryptjs';
import { awardPoints, POINTS } from './lib/gamification.js';
import { PointSource } from '@prisma/client';

async function seed() {
    console.log('🌱 Seeding database...');

    // Create teams
    const engineering = await prisma.team.upsert({
        where: { id: 'team-engineering' },
        update: {},
        create: {
            id: 'team-engineering',
            name: 'Engineering',
        },
    });

    const product = await prisma.team.upsert({
        where: { id: 'team-product' },
        update: {},
        create: {
            id: 'team-product',
            name: 'Product',
        },
    });

    const operations = await prisma.team.upsert({
        where: { id: 'team-operations' },
        update: {},
        create: {
            id: 'team-operations',
            name: 'Operations',
        },
    });

    // Create demo user
    const passwordHash = await bcrypt.hash('demo123', 10);

    const demoUser = await prisma.user.upsert({
        where: { email: 'alex@kaizenhub.com' },
        update: {},
        create: {
            email: 'alex@kaizenhub.com',
            passwordHash,
            name: 'Alex Chen',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
            role: 'MEMBER',
            teamId: engineering.id,
            position: 'Senior Software Engineer',
        },
    });

    // Create more users
    const sarah = await prisma.user.upsert({
        where: { email: 'sarah@kaizenhub.com' },
        update: {},
        create: {
            email: 'sarah@kaizenhub.com',
            passwordHash,
            name: 'Sarah Wilson',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            role: 'LEADER',
            teamId: product.id,
            position: 'Product Manager',
        },
    });

    const mike = await prisma.user.upsert({
        where: { email: 'mike@kaizenhub.com' },
        update: {},
        create: {
            email: 'mike@kaizenhub.com',
            passwordHash,
            name: 'Mike Johnson',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
            role: 'MEMBER',
            teamId: engineering.id,
            position: 'DevOps Engineer',
        },
    });

    const lisa = await prisma.user.upsert({
        where: { email: 'lisa@kaizenhub.com' },
        update: {},
        create: {
            email: 'lisa@kaizenhub.com',
            passwordHash,
            name: 'Lisa Park',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
            role: 'MEMBER',
            teamId: operations.id,
            position: 'Operations Manager',
        },
    });

    // Seed some points for demo user (clear and recreate)
    await prisma.pointTransaction.deleteMany({});
    const transactions = [
        { userId: demoUser.id, amount: 500, type: 'EARN' as const, source: 'IDEA_CREATED' as const },
        { userId: demoUser.id, amount: 300, type: 'EARN' as const, source: 'KUDOS_RECEIVED' as const },
        { userId: demoUser.id, amount: 200, type: 'EARN' as const, source: 'MISSION_COMPLETED' as const },
        { userId: demoUser.id, amount: 150, type: 'EARN' as const, source: 'IDEA_APPROVED' as const },
        { userId: demoUser.id, amount: 100, type: 'EARN' as const, source: 'STREAK_BONUS' as const },
        { userId: sarah.id, amount: 450, type: 'EARN' as const, source: 'IDEA_CREATED' as const },
        { userId: mike.id, amount: 380, type: 'EARN' as const, source: 'KUDOS_RECEIVED' as const },
        { userId: lisa.id, amount: 520, type: 'EARN' as const, source: 'MISSION_COMPLETED' as const },
    ];
    for (const tx of transactions) {
        await prisma.pointTransaction.create({ data: tx });
    }

    // Create badges
    const badges = [
        { id: 'badge-innovator', name: 'Innovator', code: 'innovator', description: 'Submitted first Kaizen idea', iconUrl: '💡' },
        { id: 'badge-helper', name: 'Helpful Hand', code: 'helper', description: 'Helped 10 colleagues', iconUrl: '🤝' },
        { id: 'badge-streak', name: 'Streak Master', code: 'streak', description: 'Maintained 7-day streak', iconUrl: '🔥' },
        { id: 'badge-champion', name: 'Kaizen Champion', code: 'champion', description: 'Had idea implemented', iconUrl: '🏆' },
        { id: 'badge-mentor', name: 'Team Mentor', code: 'mentor', description: 'Mentored 5 new members', iconUrl: '🎓' },
        { id: 'badge-explorer', name: 'Explorer', code: 'explorer', description: 'Visited all pages', iconUrl: '🧭' },
    ];

    for (const badge of badges) {
        await prisma.badge.upsert({
            where: { id: badge.id },
            update: {},
            create: badge,
        });
    }

    // Award some badges to demo user
    await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: demoUser.id, badgeId: 'badge-innovator' } },
        update: {},
        create: { userId: demoUser.id, badgeId: 'badge-innovator', reason: 'First idea submitted' },
    });

    await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: demoUser.id, badgeId: 'badge-streak' } },
        update: {},
        create: { userId: demoUser.id, badgeId: 'badge-streak', reason: '7-day streak achieved' },
    });

    // Create missions
    const missions = [
        { id: 'mission-daily-idea', name: 'Submit an Idea', description: 'Share one improvement idea today', triggerType: 'DAILY' as const, rewardPoints: 25, rulesJson: '{"event":"idea_created","min_count":1}' },
        { id: 'mission-daily-kudos', name: 'Send Kudos', description: 'Recognize a colleague', triggerType: 'DAILY' as const, rewardPoints: 15, rulesJson: '{"event":"kudos_sent","min_count":1}' },
        { id: 'mission-daily-vote', name: 'Vote on Ideas', description: 'Vote on 3 ideas', triggerType: 'DAILY' as const, rewardPoints: 10, rulesJson: '{"event":"idea_voted","min_count":3}' },
        { id: 'mission-weekly-ideas', name: 'Weekly Contributor', description: 'Submit 5 ideas this week', triggerType: 'WEEKLY' as const, rewardPoints: 100, rulesJson: '{"event":"idea_created","min_count":5}' },
    ];

    for (const mission of missions) {
        await prisma.mission.upsert({
            where: { id: mission.id },
            update: {},
            create: mission,
        });
    }

    // Create rewards
    const rewards = [
        { id: 'reward-coffee', name: 'Coffee Voucher', description: '¥500 coffee shop voucher', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300', pointsCost: 100, stock: 50, type: 'VOUCHER' as const },
        { id: 'reward-lunch', name: 'Team Lunch', description: 'Free lunch with your team', imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300', pointsCost: 300, stock: 20, type: 'VOUCHER' as const },
        { id: 'reward-dayoff', name: 'Half Day Off', description: 'Take an afternoon off', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300', pointsCost: 500, stock: 10, type: 'DAY_OFF' as const },
        { id: 'reward-tshirt', name: 'Company T-Shirt', description: 'Limited edition company t-shirt', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300', pointsCost: 200, stock: 30, type: 'MERCHANDISE' as const },
        { id: 'reward-headphones', name: 'Wireless Headphones', description: 'Premium wireless headphones', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300', pointsCost: 1000, stock: 5, type: 'MERCHANDISE' as const },
    ];

    for (const reward of rewards) {
        await prisma.reward.upsert({
            where: { id: reward.id },
            update: {},
            create: reward,
        });
    }

    // Create sample ideas
    const ideas = [
        {
            id: 'idea-1',
            creatorId: demoUser.id,
            title: 'Automate Weekly Report Generation',
            problemText: 'We spend 2+ hours every Friday compiling weekly reports manually',
            proposalText: 'Implement automated report generation using our existing dashboard data',
            impactType: 'SPEED' as const,
            status: 'APPROVED' as const,
        },
        {
            id: 'idea-2',
            creatorId: sarah.id,
            title: 'Add Recycling Bins to Office',
            problemText: 'No recycling options in the office leads to unnecessary waste',
            proposalText: 'Install color-coded recycling bins near each workstation',
            impactType: 'OTHER' as const,
            status: 'NEW' as const,
        },
        {
            id: 'idea-3',
            creatorId: mike.id,
            title: 'Optimize Image Assets',
            problemText: 'Large image files slowing down page load times',
            proposalText: 'Implement WebP format and lazy loading for all images',
            impactType: 'SPEED' as const,
            status: 'IN_REVIEW' as const,
        },
    ];

    for (const idea of ideas) {
        await prisma.kaizenIdea.upsert({
            where: { id: idea.id },
            update: {},
            create: idea,
        });
    }

    // Add some votes
    await prisma.kaizenVote.upsert({
        where: { ideaId_voterId: { ideaId: 'idea-1', voterId: sarah.id } },
        update: {},
        create: { ideaId: 'idea-1', voterId: sarah.id },
    });

    await prisma.kaizenVote.upsert({
        where: { ideaId_voterId: { ideaId: 'idea-1', voterId: mike.id } },
        update: {},
        create: { ideaId: 'idea-1', voterId: mike.id },
    });

    // Create sample kudos
    const kudosData = [
        {
            id: 'kudos-1',
            senderId: sarah.id,
            receiverId: demoUser.id,
            coreValue: 'EXCELLENCE' as const,
            message: 'Amazing work on the new feature! The attention to detail was impressive.',
        },
        {
            id: 'kudos-2',
            senderId: demoUser.id,
            receiverId: mike.id,
            coreValue: 'COLLABORATION' as const,
            message: 'Thanks for helping debug that production issue at midnight! True team player.',
        },
        {
            id: 'kudos-3',
            senderId: lisa.id,
            receiverId: sarah.id,
            coreValue: 'OWNERSHIP' as const,
            message: 'Great leadership during the product launch. You kept everyone motivated!',
        },
    ];

    for (const kudos of kudosData) {
        await prisma.kudos.upsert({
            where: { id: kudos.id },
            update: {},
            create: kudos,
        });
    }

    console.log('✅ Seed completed!');
    console.log('\n📧 Demo Login:');
    console.log('   Email: alex@kaizenhub.com');
    console.log('   Password: demo123');
}

seed()
    .catch((e) => {
        console.error('Seed error:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
