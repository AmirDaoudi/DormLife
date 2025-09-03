import bcrypt from 'bcryptjs';
import { db } from '../database/connection';
import { User, UserPreferences } from '../types';
import logger from '../utils/logger';

export class UserModel {
  static async create(userData: {
    email: string;
    password: string;
    fullName: string;
    roomNumber: string;
    graduationYear: number;
    schoolId: string;
    role?: string;
  }): Promise<User> {
    const { email, password, fullName, roomNumber, graduationYear, schoolId, role = 'student' } = userData;
    
    // Calculate grade level based on graduation year
    const currentYear = new Date().getFullYear();
    const gradeLevel = Math.max(1, Math.min(4, graduationYear - currentYear));
    const gradeNames = ['', 'Freshman', 'Sophomore', 'Junior', 'Senior'];
    const year = gradeNames[gradeLevel];
    
    // Determine floor based on room number and grade level
    const roomNum = parseInt(roomNumber);
    let floor = Math.floor(roomNum / 100);
    
    // Validate floor assignment matches grade level
    if ((floor === 2 && gradeLevel !== 1) || 
        (floor === 3 && gradeLevel !== 2) || 
        (floor === 4 && gradeLevel !== 3) || 
        (floor === 5 && gradeLevel !== 4)) {
      throw new Error(`Room ${roomNumber} is not available for ${year} students`);
    }
    
    try {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      const query = `
        INSERT INTO users (email, password_hash, full_name, room_number, year, graduation_year, school_id, role, preferences)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      
      const defaultPreferences: UserPreferences = {
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        temperaturePreference: 72,
        notificationsEnabled: true,
        biometricEnabled: false,
      };
      
      const result = await db.query(query, [
        email.toLowerCase(),
        passwordHash,
        fullName,
        roomNumber,
        year,
        graduationYear,
        schoolId,
        role,
        JSON.stringify(defaultPreferences)
      ]);
      
      logger.info(`User created successfully: ${email}`);
      return this.mapDbUserToUser(result.rows[0]);
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Email already exists');
      }
      logger.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    try {
      const query = `
        SELECT u.*, s.name as school_name 
        FROM users u 
        LEFT JOIN schools s ON u.school_id = s.id 
        WHERE u.email = $1 AND u.is_active = true
      `;
      
      const result = await db.query(query, [email.toLowerCase()]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapDbUserToUser(result.rows[0]);
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw new Error('Failed to find user');
    }
  }

  static async findById(id: string): Promise<User | null> {
    try {
      const query = `
        SELECT u.*, s.name as school_name 
        FROM users u 
        LEFT JOIN schools s ON u.school_id = s.id 
        WHERE u.id = $1 AND u.is_active = true
      `;
      
      const result = await db.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapDbUserToUser(result.rows[0]);
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw new Error('Failed to find user');
    }
  }

  static async updateById(id: string, updateData: Partial<User>): Promise<User> {
    try {
      const allowedFields = [
        'full_name',
        'room_number',
        'profile_photo_url',
        'year',
        'emergency_contact',
        'preferences'
      ];
      
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;
      
      for (const [key, value] of Object.entries(updateData)) {
        const dbKey = this.camelToSnake(key);
        if (allowedFields.includes(dbKey) && value !== undefined) {
          updates.push(`${dbKey} = $${paramCount}`);
          if (key === 'preferences') {
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
        UPDATE users 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount} AND is_active = true
        RETURNING *
      `;
      
      const result = await db.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      logger.info(`User updated successfully: ${id}`);
      return this.mapDbUserToUser(result.rows[0]);
    } catch (error) {
      logger.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  static async updateLastLogin(id: string): Promise<void> {
    try {
      const query = `
        UPDATE users 
        SET last_login = NOW(), updated_at = NOW()
        WHERE id = $1
      `;
      
      await db.query(query, [id]);
      logger.debug(`Last login updated for user: ${id}`);
    } catch (error) {
      logger.error('Error updating last login:', error);
    }
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, user.passwordHash);
    } catch (error) {
      logger.error('Error verifying password:', error);
      return false;
    }
  }

  static async setVerificationToken(email: string, token: string): Promise<void> {
    try {
      const query = `
        UPDATE users 
        SET verification_token = $1, updated_at = NOW()
        WHERE email = $2
      `;
      
      await db.query(query, [token, email.toLowerCase()]);
    } catch (error) {
      logger.error('Error setting verification token:', error);
      throw new Error('Failed to set verification token');
    }
  }

  static async verifyEmail(token: string): Promise<User | null> {
    try {
      const query = `
        UPDATE users 
        SET is_verified = true, verification_token = NULL, updated_at = NOW()
        WHERE verification_token = $1
        RETURNING *
      `;
      
      const result = await db.query(query, [token]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      logger.info(`Email verified for user: ${result.rows[0].email}`);
      return this.mapDbUserToUser(result.rows[0]);
    } catch (error) {
      logger.error('Error verifying email:', error);
      throw new Error('Failed to verify email');
    }
  }

  static async setResetToken(email: string, token: string, expires: Date): Promise<void> {
    try {
      const query = `
        UPDATE users 
        SET reset_token = $1, reset_token_expires = $2, updated_at = NOW()
        WHERE email = $3
      `;
      
      await db.query(query, [token, expires, email.toLowerCase()]);
    } catch (error) {
      logger.error('Error setting reset token:', error);
      throw new Error('Failed to set reset token');
    }
  }

  static async resetPassword(token: string, newPassword: string): Promise<User | null> {
    try {
      // First verify token is valid and not expired
      const verifyQuery = `
        SELECT id FROM users 
        WHERE reset_token = $1 AND reset_token_expires > NOW()
      `;
      
      const verifyResult = await db.query(verifyQuery, [token]);
      
      if (verifyResult.rows.length === 0) {
        return null;
      }
      
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);
      
      const updateQuery = `
        UPDATE users 
        SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW()
        WHERE reset_token = $2
        RETURNING *
      `;
      
      const result = await db.query(updateQuery, [passwordHash, token]);
      
      logger.info(`Password reset successfully for user: ${result.rows[0].email}`);
      return this.mapDbUserToUser(result.rows[0]);
    } catch (error) {
      logger.error('Error resetting password:', error);
      throw new Error('Failed to reset password');
    }
  }

  static async findBySchool(schoolId: string, limit = 50, offset = 0): Promise<User[]> {
    try {
      const query = `
        SELECT * FROM users 
        WHERE school_id = $1 AND is_active = true
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await db.query(query, [schoolId, limit, offset]);
      return result.rows.map(row => this.mapDbUserToUser(row));
    } catch (error) {
      logger.error('Error finding users by school:', error);
      throw new Error('Failed to find users');
    }
  }

  private static mapDbUserToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      passwordHash: dbUser.password_hash,
      fullName: dbUser.full_name,
      roomNumber: dbUser.room_number,
      profilePhotoUrl: dbUser.profile_photo_url,
      year: dbUser.year,
      emergencyContact: dbUser.emergency_contact,
      schoolId: dbUser.school_id,
      role: dbUser.role,
      preferences: typeof dbUser.preferences === 'string' 
        ? JSON.parse(dbUser.preferences) 
        : dbUser.preferences,
      isVerified: dbUser.is_verified,
      verificationToken: dbUser.verification_token,
      resetToken: dbUser.reset_token,
      resetTokenExpires: dbUser.reset_token_expires,
      lastLogin: dbUser.last_login,
      isActive: dbUser.is_active,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at,
    };
  }

  private static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

export default UserModel;