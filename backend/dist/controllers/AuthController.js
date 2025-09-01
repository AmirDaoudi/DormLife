"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const User_1 = require("../models/User");
const School_1 = require("../models/School");
const jwt_1 = require("../utils/jwt");
const logger_1 = __importDefault(require("../utils/logger"));
const crypto_1 = __importDefault(require("crypto"));
class AuthController {
    static async register(req, res) {
        try {
            const { email, password, fullName, schoolId } = req.body;
            // Check if school exists
            const school = await School_1.SchoolModel.findById(schoolId);
            if (!school) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid school',
                });
                return;
            }
            // Create user
            const user = await User_1.UserModel.create({
                email,
                password,
                fullName,
                schoolId,
            });
            // Generate verification token
            const verificationToken = jwt_1.JWTUtil.generateVerificationToken(email);
            await User_1.UserModel.setVerificationToken(email, verificationToken);
            logger_1.default.info(`User registered successfully: ${email}`);
            res.status(201).json({
                success: true,
                message: 'Registration successful. Please check your email to verify your account.',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        fullName: user.fullName,
                        schoolId: user.schoolId,
                        isVerified: user.isVerified,
                    },
                    verificationRequired: true,
                },
            });
        }
        catch (error) {
            logger_1.default.error('Registration error:', error);
            if (error.message === 'Email already exists') {
                res.status(409).json({
                    success: false,
                    error: 'Email already registered',
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: 'Registration failed',
                });
            }
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            // Find user
            const user = await User_1.UserModel.findByEmail(email);
            if (!user) {
                res.status(401).json({
                    success: false,
                    error: 'Invalid credentials',
                });
                return;
            }
            // Verify password
            const isValidPassword = await User_1.UserModel.verifyPassword(user, password);
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
            const tokenPayload = {
                userId: user.id,
                email: user.email,
                role: user.role,
                schoolId: user.schoolId,
            };
            const { token, refreshToken } = jwt_1.JWTUtil.generateTokens(tokenPayload);
            // Update last login
            await User_1.UserModel.updateLastLogin(user.id);
            logger_1.default.info(`User logged in successfully: ${email}`);
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
        }
        catch (error) {
            logger_1.default.error('Login error:', error);
            res.status(500).json({
                success: false,
                error: 'Login failed',
            });
        }
    }
    static async verifyEmail(req, res) {
        try {
            const { token } = req.body;
            // Verify email token
            const email = jwt_1.JWTUtil.verifyEmailToken(token);
            // Update user verification status
            const user = await User_1.UserModel.verifyEmail(token);
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
            const { token: authToken, refreshToken } = jwt_1.JWTUtil.generateTokens(tokenPayload);
            logger_1.default.info(`Email verified successfully: ${user.email}`);
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
        }
        catch (error) {
            logger_1.default.error('Email verification error:', error);
            if (error.message.includes('expired') || error.message.includes('invalid')) {
                res.status(400).json({
                    success: false,
                    error: error.message,
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: 'Email verification failed',
                });
            }
        }
    }
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            // Find user
            const user = await User_1.UserModel.findByEmail(email);
            if (!user) {
                // Don't reveal if email exists
                res.json({
                    success: true,
                    message: 'If an account with that email exists, a password reset link has been sent.',
                });
                return;
            }
            // Generate reset token
            const resetToken = crypto_1.default.randomBytes(32).toString('hex');
            const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
            await User_1.UserModel.setResetToken(email, resetToken, resetTokenExpires);
            // TODO: Send password reset email
            logger_1.default.info(`Password reset token generated for: ${email}`);
            res.json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.',
            });
        }
        catch (error) {
            logger_1.default.error('Forgot password error:', error);
            res.status(500).json({
                success: false,
                error: 'Password reset request failed',
            });
        }
    }
    static async resetPassword(req, res) {
        try {
            const { token, password } = req.body;
            // Reset password
            const user = await User_1.UserModel.resetPassword(token, password);
            if (!user) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid or expired reset token',
                });
                return;
            }
            logger_1.default.info(`Password reset successfully for: ${user.email}`);
            res.json({
                success: true,
                message: 'Password reset successfully',
            });
        }
        catch (error) {
            logger_1.default.error('Reset password error:', error);
            res.status(500).json({
                success: false,
                error: 'Password reset failed',
            });
        }
    }
    static async refreshToken(req, res) {
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
            const decoded = jwt_1.JWTUtil.verifyRefreshToken(refreshToken);
            // Get user
            const user = await User_1.UserModel.findById(decoded.userId);
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
            const tokens = jwt_1.JWTUtil.generateTokens(tokenPayload);
            logger_1.default.debug(`Token refreshed for user: ${user.email}`);
            res.json({
                success: true,
                data: tokens,
            });
        }
        catch (error) {
            logger_1.default.error('Refresh token error:', error);
            if (error.message.includes('expired') || error.message.includes('invalid')) {
                res.status(401).json({
                    success: false,
                    error: 'Invalid or expired refresh token',
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: 'Token refresh failed',
                });
            }
        }
    }
    static async logout(req, res) {
        try {
            // In a production app, you might want to blacklist the token
            // For now, we'll just return success
            logger_1.default.info(`User logged out: ${req.user?.email}`);
            res.json({
                success: true,
                message: 'Logged out successfully',
            });
        }
        catch (error) {
            logger_1.default.error('Logout error:', error);
            res.status(500).json({
                success: false,
                error: 'Logout failed',
            });
        }
    }
    static async getProfile(req, res) {
        try {
            const user = req.user;
            res.json({
                success: true,
                data: {
                    user,
                },
            });
        }
        catch (error) {
            logger_1.default.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get profile',
            });
        }
    }
}
exports.AuthController = AuthController;
exports.default = AuthController;
//# sourceMappingURL=AuthController.js.map