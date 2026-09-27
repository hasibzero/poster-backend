import express from 'express';
import cors from 'cors';
import { config } from './config';
import { connectDB } from './config/db';
import routes from './routes';
import { errorHandler, notFound } from './middleware';

const app = express();

app.use(cors({
  origin: config.frontend.url,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ensure DB is connected for serverless environments (like Vercel)
app.use(async (req, res, next) => {
  if (req.path === '/' || req.path === '/api/health') {
    return next();
  }
  
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

routes(app);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  const { disconnectDB } = await import('./config/db');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  const { disconnectDB } = await import('./config/db');
  await disconnectDB();
  process.exit(0);
});

// Only start the server if we're not running in a serverless environment like Vercel
if (!process.env.VERCEL) {
  startServer();
}

export default app;
(module as any).exports = app;