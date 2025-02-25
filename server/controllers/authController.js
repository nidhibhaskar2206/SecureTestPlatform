import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import prisma from '../prisma.js';
import { config } from '../config.js';
import { sendPasswordResetOtp } from '../utils/email.js';

const registerSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6)
});

async function testDatabaseConnection() {
  try {
      await prisma.$connect();
      console.log("Database connected successfully!");
  } catch (error) {
      console.error("Database connection error:", error);
  }
}

testDatabaseConnection();

export const register = async (req, res) => {
  try {
    console.log("Login Request Received:", req.body);
    const data = registerSchema.parse(req.body);
    console.log("Data:", data);
    
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    console.log("Existing User:");
    if (existingUser) {
      console.log("❌ User not found");
      return res.status(400).json({ status: 'error', message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    console.log("Hashed Password:", hashedPassword);
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        role: 'USER'
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

    res.status(201).json({ status: 'success', user, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log("❌ Zod Error:", error);
      res.status(400).json({ status: 'error', message: 'Invalid input data', details: error.errors });
    } else {
      res.status(500).json({ status: 'error', message: 'Server error' });
    }
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = z.object({
      email: z.string().email(),
      password: z.string()
    }).parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, config.jwtSecret);

    res.json({
      status: 'success',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: 'Invalid input data', details: error.errors });
    } else {
      res.status(500).json({ status: 'error', message: 'Server error' });
    }
  }
};

// Forgot Password - Request OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = z.object({
      email: z.string().email()
    }).parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Return 200 even if user not found for security
      return res.json({ status: 'success', message: 'If an account exists, an OTP will be sent.' });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordOtp: otp,
        resetPasswordOtpExpires: otpExpires,
        otpVerified: false
      }
    });

    await sendPasswordResetOtp(email, otp);

    res.json({ status: 'success', message: 'If an account exists, an OTP will be sent.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: 'Invalid email format' });
    } else {
      res.status(500).json({ status: 'error', message: 'Server error' });
    }
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { otp } = z.object({
      otp: z.string()
    }).parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordOtp: otp,
        resetPasswordOtpExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ status: 'error', message: 'Invalid or expired OTP' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpVerified: true
      }
    });

    res.json({ status: 'success', message: 'OTP verified successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: 'Invalid input data', details: error.errors });
    } else {
      res.status(500).json({ status: 'error', message: 'Server error' });
    }
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { newPassword } = z.object({
      newPassword: z.string().min(6)
    }).parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        otpVerified: true
      }
    });

    if (!user) {
      return res.status(400).json({ status: 'error', message: 'OTP not verified' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordOtp: null,
        resetPasswordOtpExpires: null,
        otpVerified: false
      }
    });

    res.json({ status: 'success', message: 'Password has been reset successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: 'Invalid input data', details: error.errors });
    } else {
      res.status(500).json({ status: 'error', message: 'Server error' });
    }
  }
};