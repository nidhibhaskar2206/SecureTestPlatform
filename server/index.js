import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import authRoutes from './routes/auth.js';
import testRoutes from './routes/tests.js';
import sessionRoutes from './routes/sessions.js';
// import swaggerDocs from './utils/swagger.js';
const app = express();

app.use(cors({
    origin: config.corsOrigin,
    credentials: true
}));

app.use(express.json());
// app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/sessions', sessionRoutes);
app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});
