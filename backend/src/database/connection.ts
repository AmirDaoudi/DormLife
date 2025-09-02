import { Pool, PoolConfig } from 'pg';
import { createClient, RedisClientType } from 'redis';
import logger from '../utils/logger';
import { DatabaseConfig } from '../types';

class DatabaseConnection {
  private pool!: Pool;
  private redis!: RedisClientType;
  private isConnected = false;

  constructor() {
    this.initializePostgreSQL();
    // Skip Redis for development
    // this.initializeRedis();
  }

  private initializePostgreSQL(): void {
    let poolConfig: PoolConfig;

    if (process.env.DATABASE_URL) {
      // Use DATABASE_URL (for production/Supabase)
      poolConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      };
    } else {
      // Use individual env vars (for development)
      const config: DatabaseConfig = {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
        database: process.env.POSTGRES_DB || 'dormlife_dev',
        user: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'password',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      };

      poolConfig = {
        ...config,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      };
    }

    this.pool = new Pool(poolConfig);

    this.pool.on('connect', () => {
      logger.info('PostgreSQL client connected');
    });

    this.pool.on('error', (err) => {
      logger.error('PostgreSQL client error:', err);
      process.exit(-1);
    });
  }

  private async initializeRedis(): Promise<void> {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    this.redis = createClient({
      url: redisUrl,
    });

    this.redis.on('error', (err) => {
      logger.error('Redis client error:', err);
    });

    this.redis.on('connect', () => {
      logger.info('Redis client connected');
    });

    try {
      await this.redis.connect();
    } catch (error) {
      logger.warn('Redis connection failed, continuing without Redis cache:', error);
    }
  }

  public async connect(): Promise<void> {
    try {
      // Test PostgreSQL connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      this.isConnected = true;
      logger.info('Database connections established successfully');
    } catch (error) {
      logger.error('Failed to connect to databases:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.pool.end();
      if (this.redis.isOpen) {
        await this.redis.quit();
      }
      this.isConnected = false;
      logger.info('Database connections closed');
    } catch (error) {
      logger.error('Error closing database connections:', error);
      throw error;
    }
  }

  public getPool(): Pool {
    if (!this.isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.pool;
  }

  public getRedis(): RedisClientType {
    return this.redis;
  }

  public async query(text: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      logger.error('Database query error:', { query: text, error });
      throw error;
    } finally {
      client.release();
    }
  }

  public async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transaction error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Cache methods
  public async get(key: string): Promise<string | null> {
    if (!this.redis.isOpen) return null;
    try {
      return await this.redis.get(key);
    } catch (error) {
      logger.warn('Redis get error:', error);
      return null;
    }
  }

  public async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.redis.isOpen) return;
    try {
      if (ttl) {
        await this.redis.setEx(key, ttl, value);
      } else {
        await this.redis.set(key, value);
      }
    } catch (error) {
      logger.warn('Redis set error:', error);
    }
  }

  public async del(key: string): Promise<void> {
    if (!this.redis.isOpen) return;
    try {
      await this.redis.del(key);
    } catch (error) {
      logger.warn('Redis delete error:', error);
    }
  }

  public async exists(key: string): Promise<boolean> {
    if (!this.redis.isOpen) return false;
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.warn('Redis exists error:', error);
      return false;
    }
  }
}

// Singleton instance
export const db = new DatabaseConnection();
export default db;