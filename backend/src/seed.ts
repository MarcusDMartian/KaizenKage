import prisma from './lib/prisma.js';
import bcrypt from 'bcryptjs';
import { awardPoints, POINTS } from './lib/gamification.js';
import { PointSource } from '@prisma/client';

async function seed() {
    console.log('🌱 Seeding database...');

    // Clear existing data that should be fresh
    console.log('🧹 Clearing transient data...');
    await prisma.pointTransaction.deleteMany({});
    await prisma.kaizenVote.deleteMany({});
    await prisma.kaizenComment.deleteMany({});
    await prisma.kaizenIdea.deleteMany({});
    await prisma.kudosLike.deleteMany({});
    await prisma.kudos.deleteMany({});
    await prisma.userBadge.deleteMany({});
    await prisma.userMission.deleteMany({});
    await prisma.redemptionRequest.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.user.deleteMany({});

    // Create teams
    console.log('👥 Creating teams...');
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

    // Create default Superadmin
    console.log('🔐 Creating Superadmin...');
    const passwordHash = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@kaizenhub.com' },
        update: {},
        create: {
            email: 'admin@kaizenhub.com',
            passwordHash,
            name: 'System Admin',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
            role: 'SUPERADMIN',
            teamId: engineering.id,
            position: 'Platform Administrator',
        },
    });

    // Create badges
    console.log('🏅 Creating badges...');
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

    // Create missions
    console.log('🚀 Creating missions...');
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
    console.log('🎁 Creating rewards...');
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

    console.log('✅ Seed completed!');
    console.log('\n📧 Admin Login:');
    console.log('   Email: admin@kaizenhub.com');
    console.log('   Password: admin123');
}

seed()
    .catch((e) => {
        console.error('Seed error:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
