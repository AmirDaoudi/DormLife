"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitByUser = exports.optionalAuth = exports.requireVerification = exports.requireRole = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const User_1 = require("../models/User");
const types_1 = require("../types");
const logger_1 = __importDefault(require("../utils/logger"));
const authenticate = async (req, res, next) => {
    try {
        const token = jwt_1.JWTUtil.getTokenFromHeader(req.headers.authorization);
        if (!token) {
            throw new types_1.AppError('Authentication required', 401);
        }
        const decoded = jwt_1.JWTUtil.verifyToken(token);
        // Get user from database
        const user = await User_1.UserModel.findById(decoded.userId);
        if (!user) {
            throw new types_1.AppError('User not found', 401);
        }
        if (!user.isActive) {
            throw new types_1.AppError('Account deactivated', 401);
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
    }
    catch (error) {
        logger_1.default.error('Authentication error:', error);
        if (error instanceof types_1.AppError) {
            res.status(error.statusCode).json({
                success: false,
                error: error.message,
            });
        }
        else {
            res.status(401).json({
                success: false,
                error: 'Invalid or expired token',
            });
        }
    }
};
exports.authenticate = authenticate;
const requireRole = (roles) => {
    return (req, res, next) => {
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
exports.requireRole = requireRole;
const requireVerification = (req, res, next) => {
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
exports.requireVerification = requireVerification;
const optionalAuth = async (req, res, next) => {
    try {
        const token = jwt_1.JWTUtil.getTokenFromHeader(req.headers.authorization);
        if (token) {
            const decoded = jwt_1.JWTUtil.verifyToken(token);
            const user = await User_1.UserModel.findById(decoded.userId);
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
    }
    catch (error) {
        // For optional auth, we continue even if token is invalid
        logger_1.default.debug('Optional auth failed:', error);
        next();
    }
};
exports.optionalAuth = optionalAuth;
const rateLimitByUser = (req, res, next) => {
    // This would typically integrate with Redis rate limiting
    // For now, we'll just pass through
    // TODO: Implement proper rate limiting per user
    next();
};
exports.rateLimitByUser = rateLimitByUser;
//# sourceMappingURL=auth.js.map