import 'dotenv/config';
import app from './app';
import connectDB from './config/db';

const PORT = process.env.PORT || 5000;

let server;

// Start the server ONLY after MongoDB connects
connectDB().then(() => {
  server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});

// Graceful Shutdown
const shutdown = () => {
  console.log('SIGTERM or SIGINT received. Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
