import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

// Import middleware and utilities
import { db } from './database/connection';
import { errorHandler, notFoundHandler, gracefulShutdown } from './middleware/errorHandler';
import { loggerStream } from './utils/logger';
import logger from './utils/logger';

// Import routes
import authRoutes from './routes/auth';
import schoolRoutes from './routes/schools';
import temperatureRoutes from './routes/temperature';

// Load environment variables
dotenv.config();

class DormLifeServer {
  private app: express.Application;
  private server!: http.Server;
  private io!: Server;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000');
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    const corsOptions = {
      origin: (process.env.CORS_ORIGIN || '').split(',').map(origin => origin.trim()),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    };
    
    this.app.use(cors(corsOptions));

    // Compression
    this.app.use(compression());

    // Logging
    this.app.use(morgan('combined', { stream: loggerStream }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'DormLife API is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
      });
    });

    // API info
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Welcome to DormLife API',
        version: '1.0.0',
        documentation: '/api/docs',
        endpoints: {
          auth: '/api/auth',
          schools: '/api/schools',
          users: '/api/users',
          temperature: '/api/temperature',
          requests: '/api/requests',
          announcements: '/api/announcements',
        },
      });
    });
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/schools', schoolRoutes);
    this.app.use('/api/temperature', temperatureRoutes);

    // TODO: Add more routes
    // this.app.use('/api/users', userRoutes);
    // this.app.use('/api/requests', requestRoutes);
    // this.app.use('/api/announcements', announcementRoutes);
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  private initializeSocketIO(): void {
    this.server = http.createServer(this.app);
    
    this.io = new Server(this.server, {
      cors: {
        origin: (process.env.CORS_ORIGIN || '').split(',').map(origin => origin.trim()),
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Socket.io connection handling
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // Handle user joining
      socket.on('join', (data) => {
        const { userId, schoolId } = data;
        socket.join(`school:${schoolId}`);
        socket.join(`user:${userId}`);
        
        logger.debug(`User ${userId} joined school ${schoolId}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      logger.info('Connecting to database...');
      await db.connect();

      // Run migrations
      logger.info('Running database migrations...');
      const runMigrations = await import('./database/migrate');
      await runMigrations.default();

      // Initialize Socket.IO
      this.initializeSocketIO();

      // Start server
      this.server.listen(this.port, () => {
        logger.info(`🚀 DormLife API server running on port ${this.port}`);
        logger.info(`📱 Environment: ${process.env.NODE_ENV}`);
        logger.info(`🏠 Health check: http://localhost:${this.port}/health`);
        
        if (process.env.NODE_ENV === 'development') {
          logger.info(`📖 API Documentation: http://localhost:${this.port}/`);
        }
      });

      // Setup graceful shutdown
      gracefulShutdown(this.server);

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public getApp(): express.Application {
    return this.app;
  }

  public getIO(): Server {
    return this.io;
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new DormLifeServer();
  server.start();
}

export default DormLifeServer;