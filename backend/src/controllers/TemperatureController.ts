import { Request, Response } from 'express';
import { TemperatureModel } from '../models/Temperature';
import logger from '../utils/logger';

export class TemperatureController {
  static async getCurrentTemperature(req: Request, res: Response): Promise<void> {
    try {
      const { zone } = req.query;
      
      // Get default zone for user's school if none specified
      let zoneId = zone as string;
      if (!zoneId) {
        const zones = await TemperatureModel.getZonesBySchool(req.user.schoolId);
        if (zones.length === 0) {
          res.status(404).json({
            success: false,
            error: 'No temperature zones found for your school',
          });
          return;
        }
        zoneId = zones[0].id;
      }

      const zoneData = await TemperatureModel.getZoneById(zoneId);
      if (!zoneData) {
        res.status(404).json({
          success: false,
          error: 'Temperature zone not found',
        });
        return;
      }

      const stats = await TemperatureModel.getZoneStats(zoneId);
      const userLastVote = await TemperatureModel.getUserLastVote(req.user.id, zoneId);
      const canVote = await TemperatureModel.canUserVote(req.user.id, zoneId);

      res.json({
        success: true,
        data: {
          zone: zoneData,
          temperature: zoneData.currentTemperature || 72,
          targetTemperature: zoneData.targetTemperature || 72,
          canVote,
          userLastVote,
          stats,
        },
      });
    } catch (error) {
      logger.error('Error getting current temperature:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get temperature data',
      });
    }
  }

  static async submitVote(req: Request, res: Response): Promise<void> {
    try {
      const { temperature, zone } = req.body;
      logger.info('🗳️ Temperature vote attempt:', { userId: req.user.id, temperature, zone, schoolId: req.user.schoolId });
      
      // Get default zone for user's school if none specified
      let zoneId = zone;
      if (!zoneId) {
        const zones = await TemperatureModel.getZonesBySchool(req.user.schoolId);
        if (zones.length === 0) {
          res.status(404).json({
            success: false,
            error: 'No temperature zones found for your school',
          });
          return;
        }
        zoneId = zones[0].id;
      }

      // Validate temperature range
      const zoneData = await TemperatureModel.getZoneById(zoneId);
      if (!zoneData) {
        res.status(404).json({
          success: false,
          error: 'Temperature zone not found',
        });
        return;
      }

      if (temperature < zoneData.minTemperature || temperature > zoneData.maxTemperature) {
        res.status(400).json({
          success: false,
          error: `Temperature must be between ${zoneData.minTemperature}°F and ${zoneData.maxTemperature}°F`,
        });
        return;
      }

      // Submit vote
      logger.info('🗳️ Submitting vote to database:', { userId: req.user.id, zoneId, temperature });
      const vote = await TemperatureModel.submitVote(req.user.id, zoneId, temperature);

      logger.info(`✅ Temperature vote submitted: ${req.user.email} voted ${temperature}°F`);

      res.json({
        success: true,
        message: 'Vote submitted successfully',
        data: {
          vote,
          nextVoteTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        },
      });
    } catch (error: any) {
      logger.error('Error submitting vote:', error);

      if (error.message === 'User has already voted today') {
        res.status(429).json({
          success: false,
          error: 'You can only vote once per 24 hours',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to submit vote',
        });
      }
    }
  }

  static async getTemperatureStats(req: Request, res: Response): Promise<void> {
    try {
      const { zone } = req.query;
      
      // Get default zone for user's school if none specified
      let zoneId = zone as string;
      if (!zoneId) {
        const zones = await TemperatureModel.getZonesBySchool(req.user.schoolId);
        if (zones.length === 0) {
          res.status(404).json({
            success: false,
            error: 'No temperature zones found for your school',
          });
          return;
        }
        zoneId = zones[0].id;
      }

      const stats = await TemperatureModel.getZoneStats(zoneId);
      const userLastVote = await TemperatureModel.getUserLastVote(req.user.id, zoneId);

      res.json({
        success: true,
        data: {
          ...stats,
          userLastVote,
        },
      });
    } catch (error) {
      logger.error('Error getting temperature stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get temperature statistics',
      });
    }
  }

  static async getZones(req: Request, res: Response): Promise<void> {
    try {
      const zones = await TemperatureModel.getZonesBySchool(req.user.schoolId);

      res.json({
        success: true,
        data: zones,
      });
    } catch (error) {
      logger.error('Error getting temperature zones:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get temperature zones',
      });
    }
  }
}

export default TemperatureController;