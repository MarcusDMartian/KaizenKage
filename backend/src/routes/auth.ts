import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { generateToken } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
                avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
            },
        });

        // Generate token
        const token = generateToken(user.id);

        return res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatarUrl,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ error: 'Failed to register' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check password
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate token
        const token = generateToken(user.id);

        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatarUrl,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Failed to login' });
    }
});

// POST /api/auth/logout (just for API completeness, JWT is stateless)
router.post('/logout', (req, res) => {
    return res.json({ message: 'Logged out successfully' });
});

// POST /api/auth/check-domain
router.post('/check-domain', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const domain = email.split('@')[1];
        if (!domain) return res.status(400).json({ error: 'Invalid email format' });

        const org = await prisma.organization.findUnique({
            where: { domain },
            select: { id: true, name: true }
        });

        return res.json({
            exists: !!org,
            organization: org,
            domain
        });
    } catch (error) {
        console.error('Check domain error:', error);
        return res.status(500).json({ error: 'Failed to check domain' });
    }
});

// POST /api/auth/register-org
router.post('/register-org', async (req, res) => {
    try {
        const { email, password, name, orgName } = req.body;

        if (!email || !password || !name || !orgName) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const domain = email.split('@')[1];

        // Transaction to ensure atomicity
        const result = await prisma.$transaction(async (prisma) => {
            // Check if Org already exists
            const existingOrg = await prisma.organization.findUnique({ where: { domain } });
            if (existingOrg) {
                throw new Error('Organization already exists for this domain');
            }

            // Check if User already exists
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                throw new Error('User already registered');
            }

            // Create Org
            const org = await prisma.organization.create({
                data: {
                    name: orgName,
                    domain
                }
            });

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Create Owner User (SUPERADMIN)
            const user = await prisma.user.create({
                data: {
                    email,
                    passwordHash,
                    name,
                    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
                    organizationId: org.id,
                    role: 'SUPERADMIN' // First user is Admin
                }
            });

            return { user, org };
        });

        const token = generateToken(result.user.id);

        return res.status(201).json({
            token,
            user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                avatarUrl: result.user.avatarUrl,
                role: result.user.role,
                organizationId: result.org.id
            },
            organization: result.org
        });

    } catch (error: any) {
        console.error('Register Org error:', error);
        return res.status(400).json({ error: error.message || 'Failed to register organization' });
    }
});

// POST /api/auth/join-request
router.post('/join-request', async (req, res) => {
    try {
        const { email, password, name, orgId } = req.body;

        if (!email || !password || !name || !orgId) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already registered' });
        }

        // Check if request already pending
        // We need to implement a check but schema doesn't have unique constraint on email for request yet, 
        // but let's check manually
        const existingRequest = await prisma.joinRequest.findFirst({
            where: { email, status: 'PENDING' }
        });

        if (existingRequest) {
            return res.status(400).json({ error: 'Join request already pending' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const request = await prisma.joinRequest.create({
            data: {
                email,
                name,
                passwordHash,
                orgId
            }
        });

        return res.status(201).json({
            message: 'Join request submitted successfully. Please wait for administrator approval.',
            requestId: request.id
        });

    } catch (error) {
        console.error('Join request error:', error);
        return res.status(500).json({ error: 'Failed to submit join request' });
    }
});

export default router;
