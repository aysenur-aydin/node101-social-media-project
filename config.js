import dotenv from 'dotenv';

dotenv.config();

export const DATABASE_URI = process.env.DATABASE_URI;
export const PORT = process.env.SERVER_PORT;
export const SESSION_SECRET = process.env.SESSION_SECRET;
