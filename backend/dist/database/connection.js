"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const pg_1 = require("pg");
const redis_1 = require("redis");
const logger_1 = __importDefault(require("../utils/logger"));
class DatabaseConnection {
    constructor() {
        this.isConnected = false;
        this.initializePostgreSQL();
        this.initializeRedis();
    }
    initializePostgreSQL() {
        const config = {
            host: process.env.POSTGRES_HOST || 'localhost',
            port: parseInt(process.env.POSTGRES_PORT || '5432'),
            database: process.env.POSTGRES_DB || 'dormlife_dev',
            user: process.env.POSTGRES_USER || 'postgres',
            password: process.env.POSTGRES_PASSWORD || 'password',
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        };
        const poolConfig = {
            ...config,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        };
        this.pool = new pg_1.Pool(poolConfig);
        this.pool.on('connect', () => {
            logger_1.default.info('PostgreSQL client connected');
        });
        this.pool.on('error', (err) => {
            logger_1.default.error('PostgreSQL client error:', err);
            process.exit(-1);
        });
    }
    async initializeRedis() {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        this.redis = (0, redis_1.createClient)({
            url: redisUrl,
        });
        this.redis.on('error', (err) => {
            logger_1.default.error('Redis client error:', err);
        });
        this.redis.on('connect', () => {
            logger_1.default.info('Redis client connected');
        });
        try {
            await this.redis.connect();
        }
        catch (error) {
            logger_1.default.warn('Redis connection failed, continuing without Redis cache:', error);
        }
    }
    async connect() {
        try {
            // Test PostgreSQL connection
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            this.isConnected = true;
            logger_1.default.info('Database connections established successfully');
        }
        catch (error) {
            logger_1.default.error('Failed to connect to databases:', error);
            throw error;
        }
    }
    async disconnect() {
        try {
            await this.pool.end();
            if (this.redis.isOpen) {
                await this.redis.quit();
            }
            this.isConnected = false;
            logger_1.default.info('Database connections closed');
        }
        catch (error) {
            logger_1.default.error('Error closing database connections:', error);
            throw error;
        }
    }
    getPool() {
        if (!this.isConnected) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return this.pool;
    }
    getRedis() {
        return this.redis;
    }
    async query(text, params) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(text, params);
            return result;
        }
        catch (error) {
            logger_1.default.error('Database query error:', { query: text, error });
            throw error;
        }
        finally {
            client.release();
        }
    }
    async transaction(callback) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            logger_1.default.error('Transaction error:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    // Cache methods
    async get(key) {
        if (!this.redis.isOpen)
            return null;
        try {
            return await this.redis.get(key);
        }
        catch (error) {
            logger_1.default.warn('Redis get error:', error);
            return null;
        }
    }
    async set(key, value, ttl) {
        if (!this.redis.isOpen)
            return;
        try {
            if (ttl) {
                await this.redis.setEx(key, ttl, value);
            }
            else {
                await this.redis.set(key, value);
            }
        }
        catch (error) {
            logger_1.default.warn('Redis set error:', error);
        }
    }
    async del(key) {
        if (!this.redis.isOpen)
            return;
        try {
            await this.redis.del(key);
        }
        catch (error) {
            logger_1.default.warn('Redis delete error:', error);
        }
    }
    async exists(key) {
        if (!this.redis.isOpen)
            return false;
        try {
            const result = await this.redis.exists(key);
            return result === 1;
        }
        catch (error) {
            logger_1.default.warn('Redis exists error:', error);
            return false;
        }
    }
}
// Singleton instance
exports.db = new DatabaseConnection();
exports.default = exports.db;
//# sourceMappingURL=connection.js.map