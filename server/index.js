import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config.js';
import redisClient from './utils/redis.js';
import authRoutes from './routes/auth.js';
import testRoutes from './routes/tests.js';
import sessionRoutes from './routes/sessions.js';
import dashboardRoutes from './routes/dashboard.js';
import assignRoutes from './routes/assign.js';


const app = express();

app.use(morgan("dev"));
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/assign', assignRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get("/redis-test", async (req, res) => {
  try {
    await redisClient.set("test-key", "radiovision-health", { EX: 10 });
    const value = await redisClient.get("test-key");
    res.json({
      status: "success",
      data: value,
      message: "Redis connection working!",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Redis connection failed: " + error.message,
    });
  }
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
