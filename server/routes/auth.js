import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../prisma.js';
import { config } from '../config.js';
const router = express.Router();
const registerSchema = z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(6)
});
router.post('/register', async (req, res) => {
    try {
        const data = registerSchema.parse(req.body);
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
                role: 'USER', // Force role to be USER for all registrations
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true
            }
        });
        const token = jwt.sign({ id: user.id }, config.jwtSecret);
        res.status(201).json({ user, token });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: 'Invalid input data', details: error.errors });
        }
        else {
            res.status(500).json({ error: 'Server error' });
        }
    }
});
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.id }, config.jwtSecret);
        res.json({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            },
            token
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: 'Invalid input data', details: error.errors });
        }
        else {
            res.status(500).json({ error: 'Server error' });
        }
    }
});
export default router;
