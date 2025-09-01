import { Pool } from 'pg';
import { RedisClientType } from 'redis';
declare class DatabaseConnection {
    private pool;
    private redis;
    private isConnected;
    constructor();
    private initializePostgreSQL;
    private initializeRedis;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getPool(): Pool;
    getRedis(): RedisClientType;
    query(text: string, params?: any[]): Promise<any>;
    transaction<T>(callback: (client: any) => Promise<T>): Promise<T>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
}
export declare const db: DatabaseConnection;
export default db;
//# sourceMappingURL=connection.d.ts.map