"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTUtil = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = __importDefault(require("./logger"));
class JWTUtil {
    static generateTokens(payload) {
        if (!this.JWT_SECRET || !this.JWT_REFRESH_SECRET) {
            throw new Error('JWT secrets not configured');
        }
        try {
            const token = jsonwebtoken_1.default.sign(payload, this.JWT_SECRET, {
                expiresIn: this.JWT_EXPIRES_IN,
            });
            const refreshToken = jsonwebtoken_1.default.sign({ userId: payload.userId, email: payload.email }, this.JWT_REFRESH_SECRET, {
                expiresIn: this.JWT_REFRESH_EXPIRES_IN,
            });
            return { token, refreshToken };
        }
        catch (error) {
            logger_1.default.error('JWT token generation error:', error);
            throw new Error('Token generation failed');
        }
    }
    static verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.JWT_SECRET);
            return decoded;
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token expired');
            }
            else if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid token');
            }
            logger_1.default.error('JWT verification error:', error);
            throw new Error('Token verification failed');
        }
    }
    static verifyRefreshToken(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, this.JWT_REFRESH_SECRET);
            return { userId: decoded.userId, email: decoded.email };
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Refresh token expired');
            }
            else if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid refresh token');
            }
            logger_1.default.error('Refresh token verification error:', error);
            throw new Error('Refresh token verification failed');
        }
    }
    static generateVerificationToken(email) {
        const payload = {
            email,
            type: 'email_verification',
            timestamp: Date.now(),
        };
        try {
            return jsonwebtoken_1.default.sign(payload, this.JWT_SECRET, {
                expiresIn: '24h',
            });
        }
        catch (error) {
            logger_1.default.error('Verification token generation error:', error);
            throw new Error('Token generation failed');
        }
    }
    static verifyEmailToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.JWT_SECRET);
            if (decoded.type !== 'email_verification') {
                throw new Error('Invalid token type');
            }
            return decoded.email;
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Verification token expired');
            }
            else if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid verification token');
            }
            logger_1.default.error('Email token verification error:', error);
            throw new Error('Token verification failed');
        }
    }
    static generatePasswordResetToken(userId, email) {
        const payload = {
            userId,
            email,
            type: 'password_reset',
            timestamp: Date.now(),
        };
        try {
            return jsonwebtoken_1.default.sign(payload, this.JWT_SECRET, {
                expiresIn: '1h',
            });
        }
        catch (error) {
            logger_1.default.error('Password reset token generation error:', error);
            throw new Error('Token generation failed');
        }
    }
    static verifyPasswordResetToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.JWT_SECRET);
            if (decoded.type !== 'password_reset') {
                throw new Error('Invalid token type');
            }
            return { userId: decoded.userId, email: decoded.email };
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Reset token expired');
            }
            else if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid reset token');
            }
            logger_1.default.error('Password reset token verification error:', error);
            throw new Error('Token verification failed');
        }
    }
    static getTokenFromHeader(authHeader) {
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
exports.JWTUtil = JWTUtil;
JWTUtil.JWT_SECRET = process.env.JWT_SECRET;
JWTUtil.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
JWTUtil.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
JWTUtil.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
exports.default = JWTUtil;
//# sourceMappingURL=jwt.js.map