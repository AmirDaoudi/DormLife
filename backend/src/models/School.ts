import { db } from '../database/connection';
import { School } from '../types';
import logger from '../utils/logger';

export class SchoolModel {
  static async findAll(): Promise<School[]> {
    try {
      const query = `
        SELECT * FROM schools 
        ORDER BY name ASC
      `;
      
      const result = await db.query(query);
      return result.rows.map(row => this.mapDbSchoolToSchool(row));
    } catch (error) {
      logger.error('Error finding schools:', error);
      throw new Error('Failed to fetch schools');
    }
  }

  static async findById(id: string): Promise<School | null> {
    try {
      const query = `
        SELECT * FROM schools 
        WHERE id = $1
      `;
      
      const result = await db.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapDbSchoolToSchool(result.rows[0]);
    } catch (error) {
      logger.error('Error finding school by ID:', error);
      throw new Error('Failed to find school');
    }
  }

  static async create(schoolData: {
    name: string;
    address?: string;
    logoUrl?: string;
    timezone?: string;
    settings?: Record<string, any>;
  }): Promise<School> {
    const { name, address, logoUrl, timezone = 'UTC', settings = {} } = schoolData;
    
    try {
      const query = `
        INSERT INTO schools (name, address, logo_url, timezone, settings)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const result = await db.query(query, [
        name,
        address,
        logoUrl,
        timezone,
        JSON.stringify(settings)
      ]);
      
      logger.info(`School created successfully: ${name}`);
      return this.mapDbSchoolToSchool(result.rows[0]);
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation
        throw new Error('School name already exists');
      }
      logger.error('Error creating school:', error);
      throw new Error('Failed to create school');
    }
  }

  static async updateById(id: string, updateData: Partial<School>): Promise<School> {
    try {
      const allowedFields = ['name', 'address', 'logo_url', 'timezone', 'settings'];
      
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;
      
      for (const [key, value] of Object.entries(updateData)) {
        const dbKey = this.camelToSnake(key);
        if (allowedFields.includes(dbKey) && value !== undefined) {
          updates.push(`${dbKey} = $${paramCount}`);
          if (key === 'settings') {
            values.push(JSON.stringify(value));
          } else {
            values.push(value);
          }
          paramCount++;
        }
      }
      
      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }
      
      updates.push(`updated_at = NOW()`);
      values.push(id);
      
      const query = `
        UPDATE schools 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;
      
      const result = await db.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('School not found');
      }
      
      logger.info(`School updated successfully: ${id}`);
      return this.mapDbSchoolToSchool(result.rows[0]);
    } catch (error) {
      logger.error('Error updating school:', error);
      throw new Error('Failed to update school');
    }
  }

  static async getSchoolStats(schoolId: string): Promise<{
    totalUsers: number;
    totalRequests: number;
    activeRequests: number;
    averageTemperatureVote: number;
  }> {
    try {
      const statsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM users WHERE school_id = $1 AND is_active = true) as total_users,
          (SELECT COUNT(*) FROM requests r 
           JOIN users u ON r.user_id = u.id 
           WHERE u.school_id = $1) as total_requests,
          (SELECT COUNT(*) FROM requests r 
           JOIN users u ON r.user_id = u.id 
           WHERE u.school_id = $1 AND r.status IN ('pending', 'in_progress')) as active_requests,
          (SELECT AVG(tv.temperature) FROM temperature_votes tv
           JOIN temperature_zones tz ON tv.zone_id = tz.id
           WHERE tz.school_id = $1 AND tv.created_at > NOW() - INTERVAL '7 days') as avg_temp_vote
      `;
      
      const result = await db.query(statsQuery, [schoolId]);
      const row = result.rows[0];
      
      return {
        totalUsers: parseInt(row.total_users) || 0,
        totalRequests: parseInt(row.total_requests) || 0,
        activeRequests: parseInt(row.active_requests) || 0,
        averageTemperatureVote: parseFloat(row.avg_temp_vote) || 0,
      };
    } catch (error) {
      logger.error('Error getting school stats:', error);
      throw new Error('Failed to get school statistics');
    }
  }

  private static mapDbSchoolToSchool(dbSchool: any): School {
    return {
      id: dbSchool.id,
      name: dbSchool.name,
      address: dbSchool.address,
      logoUrl: dbSchool.logo_url,
      timezone: dbSchool.timezone,
      settings: typeof dbSchool.settings === 'string' 
        ? JSON.parse(dbSchool.settings) 
        : dbSchool.settings,
      createdAt: dbSchool.created_at,
      updatedAt: dbSchool.updated_at,
    };
  }

  private static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

export default SchoolModel;