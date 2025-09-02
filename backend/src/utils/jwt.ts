import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';
import logger from './logger';

export class JWTUtil {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-dormlife';
  private static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-for-dormlife';
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
  private static readonly JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  static generateTokens(payload: JWTPayload): { token: string; refreshToken: string } {

    try {
      const token = jwt.sign(payload, this.JWT_SECRET, {
        expiresIn: this.JWT_EXPIRES_IN,
      });

      const refreshToken = jwt.sign(
        { userId: payload.userId, email: payload.email },
        this.JWT_REFRESH_SECRET,
        {
          expiresIn: this.JWT_REFRESH_EXPIRES_IN,
        }
      );

      return { token, refreshToken };
    } catch (error) {
      logger.error('JWT token generation error:', error);
      throw new Error('Token generation failed');
    }
  }

  static verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      logger.error('JWT verification error:', error);
      throw new Error('Token verification failed');
    }
  }

  static verifyRefreshToken(refreshToken: string): { userId: string; email: string } {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as any;
      return { userId: decoded.userId, email: decoded.email };
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid refresh token');
      }
      logger.error('Refresh token verification error:', error);
      throw new Error('Refresh token verification failed');
    }
  }

  static generateVerificationToken(email: string): string {
    const payload = {
      email,
      type: 'email_verification',
      timestamp: Date.now(),
    };
    
    try {
      return jwt.sign(payload, this.JWT_SECRET, {
        expiresIn: '24h',
      });
    } catch (error) {
      logger.error('Verification token generation error:', error);
      throw new Error('Token generation failed');
    }
  }

  static verifyEmailToken(token: string): string {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      
      if (decoded.type !== 'email_verification') {
        throw new Error('Invalid token type');
      }
      
      return decoded.email;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Verification token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid verification token');
      }
      logger.error('Email token verification error:', error);
      throw new Error('Token verification failed');
    }
  }

  static generatePasswordResetToken(userId: string, email: string): string {
    const payload = {
      userId,
      email,
      type: 'password_reset',
      timestamp: Date.now(),
    };
    
    try {
      return jwt.sign(payload, this.JWT_SECRET, {
        expiresIn: '1h',
      });
    } catch (error) {
      logger.error('Password reset token generation error:', error);
      throw new Error('Token generation failed');
    }
  }

  static verifyPasswordResetToken(token: string): { userId: string; email: string } {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      
      if (decoded.type !== 'password_reset') {
        throw new Error('Invalid token type');
      }
      
      return { userId: decoded.userId, email: decoded.email };
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Reset token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid reset token');
      }
      logger.error('Password reset token verification error:', error);
      throw new Error('Token verification failed');
    }
  }

  static getTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }
}

export default JWTUtil;