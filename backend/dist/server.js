"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
// Import middleware and utilities
const connection_1 = require("./database/connection");
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./utils/logger");
const logger_2 = __importDefault(require("./utils/logger"));
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const schools_1 = __importDefault(require("./routes/schools"));
const temperature_1 = __importDefault(require("./routes/temperature"));
// Load environment variables
dotenv_1.default.config();
class DormLifeServer {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = parseInt(process.env.PORT || '3000');
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    initializeMiddleware() {
        // Security middleware
        this.app.use((0, helmet_1.default)({
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
        this.app.use((0, cors_1.default)(corsOptions));
        // Compression
        this.app.use((0, compression_1.default)());
        // Logging
        this.app.use((0, morgan_1.default)('combined', { stream: logger_1.loggerStream }));
        // Body parsing
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
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
    initializeRoutes() {
        // API routes
        this.app.use('/api/auth', auth_1.default);
        this.app.use('/api/schools', schools_1.default);
        this.app.use('/api/temperature', temperature_1.default);
        // TODO: Add more routes
        // this.app.use('/api/users', userRoutes);
        // this.app.use('/api/requests', requestRoutes);
        // this.app.use('/api/announcements', announcementRoutes);
    }
    initializeErrorHandling() {
        // 404 handler
        this.app.use(errorHandler_1.notFoundHandler);
        // Global error handler
        this.app.use(errorHandler_1.errorHandler);
    }
    initializeSocketIO() {
        this.server = http_1.default.createServer(this.app);
        this.io = new socket_io_1.Server(this.server, {
            cors: {
                origin: (process.env.CORS_ORIGIN || '').split(',').map(origin => origin.trim()),
                methods: ['GET', 'POST'],
                credentials: true,
            },
        });
        // Socket.io connection handling
        this.io.on('connection', (socket) => {
            logger_2.default.info(`Client connected: ${socket.id}`);
            // Handle user joining
            socket.on('join', (data) => {
                const { userId, schoolId } = data;
                socket.join(`school:${schoolId}`);
                socket.join(`user:${userId}`);
                logger_2.default.debug(`User ${userId} joined school ${schoolId}`);
            });
            // Handle disconnection
            socket.on('disconnect', () => {
                logger_2.default.info(`Client disconnected: ${socket.id}`);
            });
        });
    }
    async start() {
        try {
            // Connect to database
            logger_2.default.info('Connecting to database...');
            await connection_1.db.connect();
            // Run migrations
            logger_2.default.info('Running database migrations...');
            const runMigrations = await Promise.resolve().then(() => __importStar(require('./database/migrate')));
            await runMigrations.default();
            // Initialize Socket.IO
            this.initializeSocketIO();
            // Start server
            this.server.listen(this.port, () => {
                logger_2.default.info(`🚀 DormLife API server running on port ${this.port}`);
                logger_2.default.info(`📱 Environment: ${process.env.NODE_ENV}`);
                logger_2.default.info(`🏠 Health check: http://localhost:${this.port}/health`);
                if (process.env.NODE_ENV === 'development') {
                    logger_2.default.info(`📖 API Documentation: http://localhost:${this.port}/`);
                }
            });
            // Setup graceful shutdown
            (0, errorHandler_1.gracefulShutdown)(this.server);
        }
        catch (error) {
            logger_2.default.error('Failed to start server:', error);
            process.exit(1);
        }
    }
    getApp() {
        return this.app;
    }
    getIO() {
        return this.io;
    }
}
// Start server if this file is run directly
if (require.main === module) {
    const server = new DormLifeServer();
    server.start();
}
exports.default = DormLifeServer;
//# sourceMappingURL=server.js.map