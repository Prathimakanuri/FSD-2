'use strict';

require('dotenv').config();
const { env } = require('./src/config/env');
const { connectDB } = require('./src/config/database');
const app = require('./src/app');

const PORT = env.PORT;

async function startServer() {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`[Server] CineBook API running on port ${PORT} (${env.NODE_ENV})`);
    console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n[Server] ${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      console.log('[Server] Database connection closed.');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('[Server] Force exit after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (err) => {
    console.error('[Server] Unhandled rejection:', err.message);
  });
}

startServer();
