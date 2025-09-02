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
    console.log('🔧 Initializing DormLife server...');
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000');
    console.log('📡 Port:', this.port);
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
    console.log('✅ Server initialized successfully');
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

    // Database test endpoint
    this.app.get('/db-test', async (req, res) => {
      try {
        console.log('🧪 Testing database connection...');
        console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
        console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20) + '...');
        
        const result = await db.query('SELECT NOW() as current_time, version() as pg_version');
        console.log('✅ Database test successful');
        
        res.json({
          success: true,
          message: 'Database connection successful',
          timestamp: result.rows[0].current_time,
          postgres_version: result.rows[0].pg_version.split(' ')[0],
        });
      } catch (error) {
        console.error('❌ Database test failed:', error);
        res.status(500).json({
          success: false,
          error: 'Database connection failed',
          details: error.message,
          code: error.code,
        });
      }
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
      // Initialize Socket.IO first
      this.initializeSocketIO();

      // Start server first - this will allow health checks to work
      this.server.listen(this.port, () => {
        logger.info(`🚀 DormLife API server running on port ${this.port}`);
        logger.info(`📱 Environment: ${process.env.NODE_ENV}`);
        logger.info(`🏠 Health check: http://localhost:${this.port}/health`);
        
        if (process.env.NODE_ENV === 'development') {
          logger.info(`📖 API Documentation: http://localhost:${this.port}/`);
        }
      });

      // Connect to database
      logger.info('🗄️ Connecting to database...');
      await db.connect();
      logger.info('✅ Database connected successfully');

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
  server.start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

export default DormLifeServer;