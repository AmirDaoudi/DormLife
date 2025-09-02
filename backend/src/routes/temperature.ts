import { Router } from 'express';
import { TemperatureController } from '../controllers/TemperatureController';
import { authenticate, requireVerification } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { temperatureSchemas, paginationSchema } from '../middleware/validation';

const router = Router();

// All temperature routes require authentication only (skip verification for now)
router.use(authenticate);

// Get current temperature data
router.get('/current', TemperatureController.getCurrentTemperature);

// Submit temperature vote
router.post('/vote', validate(temperatureSchemas.vote), TemperatureController.submitVote);

// Get temperature statistics
router.get('/stats', TemperatureController.getTemperatureStats);

// Get temperature zones
router.get('/zones', TemperatureController.getZones);

export default router;