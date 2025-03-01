import express from 'express';
import { auth } from '../middleware/auth.js';
import { getDashboardData } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/dashboard-data', auth, getDashboardData);

export default router;