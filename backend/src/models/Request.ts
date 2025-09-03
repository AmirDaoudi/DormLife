import { QueryResult } from 'pg';
import db from '../database/connection';
import logger from '../utils/logger';

export interface RequestData {
  id?: string;
  user_id: string;
  category_id?: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'pending' | 'in_progress' | 'resolved' | 'closed';
  is_anonymous?: boolean;
  photos?: string[];
  upvotes?: number;
  assigned_to?: string;
  resolved_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export class RequestModel {
  static async create(requestData: RequestData): Promise<RequestData> {
    const query = `
      INSERT INTO requests (
        user_id, title, description, priority, is_anonymous, photos, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING id, user_id, title, description, priority, status, is_anonymous, 
                photos, upvotes, created_at, updated_at
    `;

    const values = [
      requestData.user_id,
      requestData.title,
      requestData.description,
      requestData.priority,
      requestData.is_anonymous || false,
      JSON.stringify(requestData.photos || [])
    ];

    try {
      const result: QueryResult = await db.query(query, values);
      logger.info('✅ Request created in database:', { requestId: result.rows[0].id });
      return result.rows[0];
    } catch (error) {
      logger.error('❌ Error creating request:', error);
      throw error;
    }
  }

  static async findAll(limit: number = 50, offset: number = 0): Promise<RequestData[]> {
    const query = `
      SELECT r.id, r.user_id, r.title, r.description, r.priority, r.status,
             r.is_anonymous, r.photos, r.upvotes, r.created_at, r.updated_at,
             u.full_name, u.room_number
      FROM requests r
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    try {
      const result: QueryResult = await db.query(query, [limit, offset]);
      return result.rows;
    } catch (error) {
      logger.error('❌ Error fetching requests:', error);
      throw error;
    }
  }

  static async findById(id: string): Promise<RequestData | null> {
    const query = `
      SELECT r.id, r.user_id, r.title, r.description, r.priority, r.status,
             r.is_anonymous, r.photos, r.upvotes, r.created_at, r.updated_at,
             u.full_name, u.room_number
      FROM requests r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = $1
    `;

    try {
      const result: QueryResult = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('❌ Error fetching request:', error);
      throw error;
    }
  }

  static async updateStatus(id: string, status: string, adminNotes?: string): Promise<RequestData> {
    const query = `
      UPDATE requests 
      SET status = $1, resolved_at = CASE WHEN $1 = 'resolved' THEN NOW() ELSE resolved_at END,
          updated_at = NOW()
      WHERE id = $2
      RETURNING id, user_id, title, description, priority, status, is_anonymous, 
                photos, upvotes, created_at, updated_at, resolved_at
    `;

    try {
      const result: QueryResult = await db.query(query, [status, id]);
      return result.rows[0];
    } catch (error) {
      logger.error('❌ Error updating request status:', error);
      throw error;
    }
  }

  static async incrementUpvotes(id: string): Promise<RequestData> {
    const query = `
      UPDATE requests 
      SET upvotes = upvotes + 1, updated_at = NOW()
      WHERE id = $1
      RETURNING id, user_id, title, description, priority, status, is_anonymous, 
                photos, upvotes, created_at, updated_at
    `;

    try {
      const result: QueryResult = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      logger.error('❌ Error incrementing upvotes:', error);
      throw error;
    }
  }
}

export default RequestModel;