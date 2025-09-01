import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { authSchemas } from '../middleware/validation';

const router = Router();

// Public routes
router.post('/register', validate(authSchemas.register), AuthController.register);
router.post('/login', validate(authSchemas.login), AuthController.login);
router.post('/verify-email', validate(authSchemas.verifyEmail), AuthController.verifyEmail);
router.post('/forgot-password', validate(authSchemas.forgotPassword), AuthController.forgotPassword);
router.post('/reset-password', validate(authSchemas.resetPassword), AuthController.resetPassword);
router.post('/refresh-token', validate(authSchemas.refreshToken), AuthController.refreshToken);

// Protected routes
router.post('/logout', authenticate, AuthController.logout);
router.get('/profile', authenticate, AuthController.getProfile);

export default router;