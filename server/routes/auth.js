import express from 'express';
import {
  register,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getAllUsers
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.get('/get-users', getAllUsers);

export default router;







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

//rebase test 1
