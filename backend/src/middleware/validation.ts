import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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

      logger.warn('Validation error:', { errors, body: req.body });

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

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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

      logger.warn('Query validation error:', { errors, query: req.query });

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

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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

      logger.warn('Params validation error:', { errors, params: req.params });

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

// Common validation schemas
export const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(8).required(),
    fullName: Joi.string().min(2).max(255).required(),
    schoolId: Joi.string().uuid().required(),
  }),

  login: Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().required(),
  }),

  verifyEmail: Joi.object({
    token: Joi.string().required(),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().lowercase().required(),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(8).required(),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};

export const userSchemas = {
  updateProfile: Joi.object({
    fullName: Joi.string().min(2).max(255).optional(),
    roomNumber: Joi.string().max(50).optional(),
    year: Joi.string().max(50).optional(),
    emergencyContact: Joi.string().max(255).optional(),
    preferences: Joi.object({
      quietHoursStart: Joi.string().pattern(/^([01]?\d|2[0-3]):[0-5]\d$/).optional(),
      quietHoursEnd: Joi.string().pattern(/^([01]?\d|2[0-3]):[0-5]\d$/).optional(),
      temperaturePreference: Joi.number().min(65).max(80).optional(),
      notificationsEnabled: Joi.boolean().optional(),
      biometricEnabled: Joi.boolean().optional(),
    }).optional(),
  }),
};

export const temperatureSchemas = {
  vote: Joi.object({
    temperature: Joi.number().min(65).max(80).required(),
    zone: Joi.string().optional(), // Allow any string, not just UUID
  }),
};

export const requestSchemas = {
  create: Joi.object({
    category: Joi.string().required(), // Accept any string for category
    title: Joi.string().min(5).max(255).required(),
    description: Joi.string().min(10).max(2000).required(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    isAnonymous: Joi.boolean().default(false),
    photos: Joi.array().items(Joi.string()).max(5).optional(),
  }),

  update: Joi.object({
    status: Joi.string().valid('pending', 'in_progress', 'resolved', 'closed').optional(),
    assignedTo: Joi.string().uuid().optional(),
  }),

  comment: Joi.object({
    content: Joi.string().min(1).max(500).required(),
  }),
};

export const announcementSchemas = {
  create: Joi.object({
    title: Joi.string().min(5).max(255).required(),
    content: Joi.string().min(10).max(2000).required(),
    type: Joi.string().valid('general', 'emergency', 'maintenance', 'event').default('general'),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    targetAudience: Joi.array().items(Joi.string()).optional(),
    expiresAt: Joi.date().greater('now').optional(),
  }),

  update: Joi.object({
    title: Joi.string().min(5).max(255).optional(),
    content: Joi.string().min(10).max(2000).optional(),
    type: Joi.string().valid('general', 'emergency', 'maintenance', 'event').optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
    targetAudience: Joi.array().items(Joi.string()).optional(),
    expiresAt: Joi.date().greater('now').optional(),
    isActive: Joi.boolean().optional(),
  }),
};

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().optional(),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});

export const uuidSchema = Joi.object({
  id: Joi.string().uuid().required(),
});