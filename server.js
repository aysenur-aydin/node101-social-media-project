import { createServer } from 'node:http';
import mongoose from 'mongoose';

import app from './app.js';
import { DATABASE_URI, PORT } from './config.js';
import initializeSocket from './socket/socket.js';
import { sessionMiddleware } from './middlewares/session.js';

const server = createServer(app);

const io = initializeSocket(server, sessionMiddleware);

const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(DATABASE_URI);
    console.log('✅ Connected to MongoDB');

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Socket.IO enabled`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
