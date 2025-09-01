"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uuidSchema = exports.paginationSchema = exports.announcementSchemas = exports.requestSchemas = exports.temperatureSchemas = exports.userSchemas = exports.authSchemas = exports.validateParams = exports.validateQuery = exports.validate = void 0;
const joi_1 = __importDefault(require("joi"));
const logger_1 = __importDefault(require("../utils/logger"));
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context?.value,
            }));
            logger_1.default.warn('Validation error:', { errors, body: req.body });
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors,
            });
            return;
        }
        // Replace req.body with validated and sanitized data
        req.body = value;
        next();
    };
};
exports.validate = validate;
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context?.value,
            }));
            logger_1.default.warn('Query validation error:', { errors, query: req.query });
            res.status(400).json({
                success: false,
                error: 'Query validation failed',
                details: errors,
            });
            return;
        }
        req.query = value;
        next();
    };
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context?.value,
            }));
            logger_1.default.warn('Params validation error:', { errors, params: req.params });
            res.status(400).json({
                success: false,
                error: 'Parameter validation failed',
                details: errors,
            });
            return;
        }
        req.params = value;
        next();
    };
};
exports.validateParams = validateParams;
// Common validation schemas
exports.authSchemas = {
    register: joi_1.default.object({
        email: joi_1.default.string().email().lowercase().required(),
        password: joi_1.default.string().min(8).required(),
        fullName: joi_1.default.string().min(2).max(255).required(),
        schoolId: joi_1.default.string().uuid().required(),
    }),
    login: joi_1.default.object({
        email: joi_1.default.string().email().lowercase().required(),
        password: joi_1.default.string().required(),
    }),
    verifyEmail: joi_1.default.object({
        token: joi_1.default.string().required(),
    }),
    forgotPassword: joi_1.default.object({
        email: joi_1.default.string().email().lowercase().required(),
    }),
    resetPassword: joi_1.default.object({
        token: joi_1.default.string().required(),
        password: joi_1.default.string().min(8).required(),
    }),
    refreshToken: joi_1.default.object({
        refreshToken: joi_1.default.string().required(),
    }),
};
exports.userSchemas = {
    updateProfile: joi_1.default.object({
        fullName: joi_1.default.string().min(2).max(255).optional(),
        roomNumber: joi_1.default.string().max(50).optional(),
        year: joi_1.default.string().max(50).optional(),
        emergencyContact: joi_1.default.string().max(255).optional(),
        preferences: joi_1.default.object({
            quietHoursStart: joi_1.default.string().pattern(/^([01]?\d|2[0-3]):[0-5]\d$/).optional(),
            quietHoursEnd: joi_1.default.string().pattern(/^([01]?\d|2[0-3]):[0-5]\d$/).optional(),
            temperaturePreference: joi_1.default.number().min(65).max(80).optional(),
            notificationsEnabled: joi_1.default.boolean().optional(),
            biometricEnabled: joi_1.default.boolean().optional(),
        }).optional(),
    }),
};
exports.temperatureSchemas = {
    vote: joi_1.default.object({
        temperature: joi_1.default.number().min(65).max(80).required(),
        zone: joi_1.default.string().uuid().optional(),
    }),
};
exports.requestSchemas = {
    create: joi_1.default.object({
        categoryId: joi_1.default.string().uuid().required(),
        title: joi_1.default.string().min(5).max(255).required(),
        description: joi_1.default.string().min(10).max(2000).required(),
        priority: joi_1.default.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
        isAnonymous: joi_1.default.boolean().default(false),
        photos: joi_1.default.array().items(joi_1.default.string().uri()).max(5).optional(),
    }),
    update: joi_1.default.object({
        status: joi_1.default.string().valid('pending', 'in_progress', 'resolved', 'closed').optional(),
        assignedTo: joi_1.default.string().uuid().optional(),
    }),
    comment: joi_1.default.object({
        content: joi_1.default.string().min(1).max(500).required(),
    }),
};
exports.announcementSchemas = {
    create: joi_1.default.object({
        title: joi_1.default.string().min(5).max(255).required(),
        content: joi_1.default.string().min(10).max(2000).required(),
        type: joi_1.default.string().valid('general', 'emergency', 'maintenance', 'event').default('general'),
        priority: joi_1.default.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
        targetAudience: joi_1.default.array().items(joi_1.default.string()).optional(),
        expiresAt: joi_1.default.date().greater('now').optional(),
    }),
    update: joi_1.default.object({
        title: joi_1.default.string().min(5).max(255).optional(),
        content: joi_1.default.string().min(10).max(2000).optional(),
        type: joi_1.default.string().valid('general', 'emergency', 'maintenance', 'event').optional(),
        priority: joi_1.default.string().valid('low', 'medium', 'high', 'urgent').optional(),
        targetAudience: joi_1.default.array().items(joi_1.default.string()).optional(),
        expiresAt: joi_1.default.date().greater('now').optional(),
        isActive: joi_1.default.boolean().optional(),
    }),
};
exports.paginationSchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(20),
    sort: joi_1.default.string().optional(),
    order: joi_1.default.string().valid('asc', 'desc').default('desc'),
});
exports.uuidSchema = joi_1.default.object({
    id: joi_1.default.string().uuid().required(),
});
//# sourceMappingURL=validation.js.map