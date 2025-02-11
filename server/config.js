import dotenv from 'dotenv';
dotenv.config();
export const config = {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    port: process.env.PORT || 3000,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173'
};
