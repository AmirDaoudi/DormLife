import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { SchoolModel } from '../models/School';
import { JWTUtil } from '../utils/jwt';
import { AppError } from '../types';
import logger from '../utils/logger';
import crypto from 'crypto';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, fullName, roomNumber, graduationYear, schoolId } = req.body;

      // Check if school exists
      const school = await SchoolModel.findById(schoolId);
      if (!school) {
        res.status(400).json({
          success: false,
          error: 'Invalid school',
        });
        return;
      }

      // Create user with room and graduation year (if provided)
      const user = await UserModel.create({
        email,
        password,
        fullName,
        roomNumber: roomNumber || undefined,
        graduationYear: graduationYear || undefined,
        schoolId,
      });

      // Generate verification token
      const verificationToken = JWTUtil.generateVerificationToken(email);
      await UserModel.setVerificationToken(email, verificationToken);

      // Auto-verify user for testing
      await UserModel.verifyEmail(verificationToken);
      const verifiedUser = await UserModel.findById(user.id);
      
      logger.info(`User registered and auto-verified: ${email}`);

      res.status(201).json({
        success: true,
        message: 'Registration successful. Your account is ready to use.',
        data: {
          user: {
            id: verifiedUser.id,
            email: verifiedUser.email,
            fullName: verifiedUser.fullName,
            schoolId: verifiedUser.schoolId,
            isVerified: verifiedUser.isVerified,
          },
          verificationRequired: false,
        },
      });
    } catch (error: any) {
      logger.error('Registration error:', error);

      if (error.message === 'Email already exists') {
        res.status(409).json({
          success: false,
          error: 'Email already registered',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Registration failed',
        });
      }
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      logger.info(`🔐 Login attempt for: ${email}`);

      // Find user
      logger.info('🔍 Finding user in database...');
      const user = await UserModel.findByEmail(email);
      logger.info(`👤 User found: ${user ? 'Yes' : 'No'}`);
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
        return;
      }

      // Verify password
      logger.info('🔑 Verifying password...');
      const isValidPassword = await UserModel.verifyPassword(user, password);
      logger.info(`✅ Password valid: ${isValidPassword}`);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        res.status(401).json({
          success: false,
          error: 'Account deactivated',
        });
        return;
      }

      // Generate tokens
      logger.info('🎫 Generating JWT tokens...');
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
      };

      const { token, refreshToken } = JWTUtil.generateTokens(tokenPayload);
      logger.info('✅ Tokens generated successfully');

      // Update last login
      await UserModel.updateLastLogin(user.id);

      logger.info(`User logged in successfully: ${email}`);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
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
            createdAt: user.createdAt,
          },
          token,
          refreshToken,
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed',
      });
    }
  }

  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      // Verify email token
      const email = JWTUtil.verifyEmailToken(token);
      
      // Update user verification status
      const user = await UserModel.verifyEmail(token);
      if (!user) {
        res.status(400).json({
          success: false,
          error: 'Invalid or expired verification token',
        });
        return;
      }

      // Generate auth tokens for the verified user
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
      };

      const { token: authToken, refreshToken } = JWTUtil.generateTokens(tokenPayload);

      logger.info(`Email verified successfully: ${user.email}`);

      res.json({
        success: true,
        message: 'Email verified successfully',
        data: {
          user: {
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
            createdAt: user.createdAt,
          },
          token: authToken,
          refreshToken,
        },
      });
    } catch (error: any) {
      logger.error('Email verification error:', error);

      if (error.message.includes('expired') || error.message.includes('invalid')) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Email verification failed',
        });
      }
    }
  }

  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists
        res.json({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.',
        });
        return;
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await UserModel.setResetToken(email, resetToken, resetTokenExpires);

      // TODO: Send password reset email
      logger.info(`Password reset token generated for: ${email}`);

      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    } catch (error) {
      logger.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        error: 'Password reset request failed',
      });
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;

      // Reset password
      const user = await UserModel.resetPassword(token, password);
      if (!user) {
        res.status(400).json({
          success: false,
          error: 'Invalid or expired reset token',
        });
        return;
      }

      logger.info(`Password reset successfully for: ${user.email}`);

      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      logger.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        error: 'Password reset failed',
      });
    }
  }

  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          error: 'Refresh token required',
        });
        return;
      }

      // Verify refresh token
      const decoded = JWTUtil.verifyRefreshToken(refreshToken);

      // Get user
      const user = await UserModel.findById(decoded.userId);
      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          error: 'Invalid refresh token',
        });
        return;
      }

      // Generate new tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
      };

      const tokens = JWTUtil.generateTokens(tokenPayload);

      logger.debug(`Token refreshed for user: ${user.email}`);

      res.json({
        success: true,
        data: tokens,
      });
    } catch (error: any) {
      logger.error('Refresh token error:', error);

      if (error.message.includes('expired') || error.message.includes('invalid')) {
        res.status(401).json({
          success: false,
          error: 'Invalid or expired refresh token',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Token refresh failed',
        });
      }
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // In a production app, you might want to blacklist the token
      // For now, we'll just return success
      
      logger.info(`User logged out: ${req.user?.email}`);

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed',
      });
    }
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      res.json({
        success: true,
        data: {
          user,
        },
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get profile',
      });
    }
  }
}

export default AuthController;