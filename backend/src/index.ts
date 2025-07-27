import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cookieParser from 'cookie-parser';

import { logger } from './config/logger.js';
import { connectDatabase } from './config/database.js';
import { initializeJobs } from './jobs/index.js';
import { config } from './config/index.js';

// Import routes
import authRoutes from './routes/auth.js';
import automationRoutes from './routes/automations.js';
import portfolioRoutes from './routes/portfolio.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { authenticateToken } from './middleware/auth.js';

class Application {
  public app: express.Application;
  public server: any;
  public io: SocketIOServer;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: config.corsOrigin,
        methods: ['GET', 'POST'],
      },
    });

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.setupSocketIO();
  }

  private initializeMiddleware(): void {
    // CORS configuration
    this.app.use(cors({
      origin: config.corsOrigin,
      credentials: true,
    }));

    // Body parsing
    this.app.use(cookieParser());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(requestLogger);

    // Health check endpoint (before auth)
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        version: process.env.npm_package_version || '1.0.0',
      });
    });
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/automations', authenticateToken, automationRoutes);
    this.app.use('/api/portfolio', authenticateToken, portfolioRoutes);

    // Catch-all for undefined routes
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method,
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private setupSocketIO(): void {
    this.io.use((socket, next) => {
      // Socket authentication middleware
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      // Validate token here
      next();
    });

    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      socket.on('join_user_room', (userId: string) => {
        socket.join(`user:${userId}`);
        logger.info(`User ${userId} joined their room`);
      });

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await connectDatabase();

      // Initialize background jobs
      await initializeJobs();

      // Start server
      this.server.listen(config.port, () => {
        logger.info(`🚀 Server running on port ${config.port}`);
        logger.info(`📊 Environment: ${config.nodeEnv}`);
        logger.info(`💾 Database: Connected`);
        logger.info(`🔄 Background jobs: Started`);
        
        if (config.enableAiSuggestions) {
          logger.info(`🤖 AI suggestions: Enabled`);
        }
        
        if (config.enableCrossChain) {
          logger.info(`🌉 Cross-chain: Enabled`);
        }
      });

      // Graceful shutdown
      this.setupGracefulShutdown();

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      
      this.server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }
}

// Start the application
const app = new Application();
app.start().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});

export default app; 