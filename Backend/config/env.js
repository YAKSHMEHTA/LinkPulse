import dotenv from 'dotenv';

dotenv.config();

export const env = {
  isProd:
    process.env.isProd === 'true' ||
    process.env.NODE_ENV === 'production' ||
    process.env.RENDER === 'true' ||
    process.env.VERCEL === '1',
  jwtSecret: process.env.access_token_secret || process.env.JWT_SECRET || 'dev-secret-change-me',
};
