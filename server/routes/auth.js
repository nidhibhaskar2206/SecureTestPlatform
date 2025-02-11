import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import prisma from '../prisma.js';
import { config } from '../config.js';
import { sendPasswordResetOtp } from '../utils/email.js';

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

    res.status(201).json({ user, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = z.object({
      email: z.string().email(),
      password: z.string()
    }).parse(req.body);

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
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Forgot Password - Request OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = z.object({
      email: z.string().email()
    }).parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Return 200 even if user not found for security
      return res.json({ message: 'If an account exists, an OTP will be sent.' });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordOtp: otp,
        resetPasswordOtpExpires: otpExpires
      }
    });

    await sendPasswordResetOtp(email, otp);

    res.json({ message: 'If an account exists, an OTP will be sent.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid email format' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Reset Password with OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { otp, newPassword } = z.object({
      otp: z.string(),
      newPassword: z.string().min(6)
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
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordOtp: null,
        resetPasswordOtpExpires: null
      }
    });

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// // Forgot Password - Request reset
// router.post('/forgot-password', async (req, res) => {
//   try {
//     const { email } = z.object({
//       email: z.string().email()
//     }).parse(req.body);

//     const user = await prisma.user.findUnique({
//       where: { email }
//     });

//     if (!user) {
//       // Return 200 even if user not found for security
//       return res.json({ message: 'If an account exists, a password reset email will be sent.' });
//     }

//     // Generate reset token
//     const resetToken = crypto.randomBytes(32).toString('hex');
//     const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

//     await prisma.user.update({
//       where: { id: user.id },
//       data: {
//         resetPasswordToken: resetToken,
//         resetPasswordExpires
//       }
//     });

//     await sendPasswordResetEmail(email, resetToken);

//     res.json({ message: 'If an account exists, a password reset email will be sent.' });
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       res.status(400).json({ error: 'Invalid email format' });
//     } else {
//       res.status(500).json({ error: 'Server error' });
//     }
//   }
// });

// // Reset Password with token
// router.post('/reset-password', async (req, res) => {
//   try {
//     const { token, newPassword } = z.object({
//       token: z.string(),
//       newPassword: z.string().min(6)
//     }).parse(req.body);

//     const user = await prisma.user.findFirst({
//       where: {
//         resetPasswordToken: token,
//         resetPasswordExpires: {
//           gt: new Date()
//         }
//       }
//     });

//     if (!user) {
//       return res.status(400).json({ error: 'Invalid or expired reset token' });
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     await prisma.user.update({
//       where: { id: user.id },
//       data: {
//         password: hashedPassword,
//         resetPasswordToken: null,
//         resetPasswordExpires: null
//       }
//     });

//     res.json({ message: 'Password has been reset successfully' });
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       res.status(400).json({ error: 'Invalid input data', details: error.errors });
//     } else {
//       res.status(500).json({ error: 'Server error' });
//     }
//   }
// });

export default router;