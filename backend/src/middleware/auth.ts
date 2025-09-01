import { Request, Response, NextFunction } from 'express';
import { JWTUtil } from '../utils/jwt';
import { UserModel } from '../models/User';
import { AppError } from '../types';
import logger from '../utils/logger';

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = JWTUtil.getTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = JWTUtil.verifyToken(token);
    
    // Get user from database
    const user = await UserModel.findById(decoded.userId);
    
    if (!user) {
      throw new AppError('User not found', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account deactivated', 401);
    }

    // Attach user to request object (without password hash)
    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roomNumber: user.roomNumber,
      profilePhotoUrl: user.profilePhotoUrl,
      year: user.year,
      emergencyContact: user.emergencyContact,
      schoolId: user.schoolId,
      role: user.role,
      preferences: user.preferences,
      isVerified: user.isVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    next();
  } catch (error: any) {
    logger.error('Authentication error:', error);
    
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }
  }
};

export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};

export const requireVerification = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
    return;
  }

  if (!req.user.isVerified) {
    res.status(403).json({
      success: false,
      error: 'Email verification required',
    });
    return;
  }

  next();
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = JWTUtil.getTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const decoded = JWTUtil.verifyToken(token);
      const user = await UserModel.findById(decoded.userId);
      
      if (user && user.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          roomNumber: user.roomNumber,
          profilePhotoUrl: user.profilePhotoUrl,
          year: user.year,
          emergencyContact: user.emergencyContact,
          schoolId: user.schoolId,
          role: user.role,
          preferences: user.preferences,
          isVerified: user.isVerified,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      }
    }

    next();
  } catch (error) {
    // For optional auth, we continue even if token is invalid
    logger.debug('Optional auth failed:', error);
    next();
  }
};

export const rateLimitByUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // This would typically integrate with Redis rate limiting
  // For now, we'll just pass through
  // TODO: Implement proper rate limiting per user
  next();
};