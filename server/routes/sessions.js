import express from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { auth } from '../middleware/auth.js';
const router = express.Router();
// Start test session
router.post('/start/:testId', auth, async (req, res) => {
    try {
        const testId = parseInt(req.params.testId);
        const test = await prisma.test.findUnique({
            where: { id: testId },
            include: {
                userTests: {
                    where: {
                        userId: req.user.id
                    }
                }
            }
        });
        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }
        if (test.userTests.length === 0) {
            return res.status(403).json({ error: 'You are not assigned to this test' });
        }
        const activeSession = await prisma.session.findFirst({
            where: {
                userId: req.user.id,
                testId,
                status: 'IN_PROGRESS'
            }
        });
        if (activeSession) {
            return res.status(400).json({ error: 'You already have an active session for this test' });
        }
        const session = await prisma.session.create({
            data: {
                userId: req.user.id,
                testId,
                status: 'IN_PROGRESS',
                startTime: new Date(),
                endTime: new Date(Date.now() + test.duration * 60000)
            }
        });
        res.status(201).json(session);
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid request' });
    }
});
// Record warning
router.post('/warning/:sessionId', auth, async (req, res) => {
    try {
        const sessionId = parseInt(req.params.sessionId);
        const { warningType } = z.object({
            warningType: z.enum(['TAB_SWITCH', 'COPY_PASTE'])
        }).parse(req.body);
        const warning = await prisma.warning.create({
            data: {
                sessionId,
                warningType,
                timestamp: new Date()
            }
        });
        res.status(201).json(warning);
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid request' });
    }
});
// End test session
router.post('/end/:sessionId', auth, async (req, res) => {
    try {
        const sessionId = parseInt(req.params.sessionId);
        const { score } = z.object({
            score: z.number().min(0)
        }).parse(req.body);
        const session = await prisma.session.update({
            where: { id: sessionId },
            data: {
                status: 'COMPLETED',
                endTime: new Date(),
                score
            }
        });
        res.json(session);
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid request' });
    }
});
export default router;
