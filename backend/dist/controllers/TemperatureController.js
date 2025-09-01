"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemperatureController = void 0;
const Temperature_1 = require("../models/Temperature");
const logger_1 = __importDefault(require("../utils/logger"));
class TemperatureController {
    static async getCurrentTemperature(req, res) {
        try {
            const { zone } = req.query;
            // Get default zone for user's school if none specified
            let zoneId = zone;
            if (!zoneId) {
                const zones = await Temperature_1.TemperatureModel.getZonesBySchool(req.user.schoolId);
                if (zones.length === 0) {
                    res.status(404).json({
                        success: false,
                        error: 'No temperature zones found for your school',
                    });
                    return;
                }
                zoneId = zones[0].id;
            }
            const zoneData = await Temperature_1.TemperatureModel.getZoneById(zoneId);
            if (!zoneData) {
                res.status(404).json({
                    success: false,
                    error: 'Temperature zone not found',
                });
                return;
            }
            const stats = await Temperature_1.TemperatureModel.getZoneStats(zoneId);
            const userLastVote = await Temperature_1.TemperatureModel.getUserLastVote(req.user.id, zoneId);
            const canVote = await Temperature_1.TemperatureModel.canUserVote(req.user.id, zoneId);
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
        }
        catch (error) {
            logger_1.default.error('Error getting current temperature:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get temperature data',
            });
        }
    }
    static async submitVote(req, res) {
        try {
            const { temperature, zone } = req.body;
            // Get default zone for user's school if none specified
            let zoneId = zone;
            if (!zoneId) {
                const zones = await Temperature_1.TemperatureModel.getZonesBySchool(req.user.schoolId);
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
            const zoneData = await Temperature_1.TemperatureModel.getZoneById(zoneId);
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
            const vote = await Temperature_1.TemperatureModel.submitVote(req.user.id, zoneId, temperature);
            logger_1.default.info(`Temperature vote submitted: ${req.user.email} voted ${temperature}°F`);
            res.json({
                success: true,
                message: 'Vote submitted successfully',
                data: {
                    vote,
                    nextVoteTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
                },
            });
        }
        catch (error) {
            logger_1.default.error('Error submitting vote:', error);
            if (error.message === 'User has already voted today') {
                res.status(429).json({
                    success: false,
                    error: 'You can only vote once per 24 hours',
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: 'Failed to submit vote',
                });
            }
        }
    }
    static async getTemperatureStats(req, res) {
        try {
            const { zone } = req.query;
            // Get default zone for user's school if none specified
            let zoneId = zone;
            if (!zoneId) {
                const zones = await Temperature_1.TemperatureModel.getZonesBySchool(req.user.schoolId);
                if (zones.length === 0) {
                    res.status(404).json({
                        success: false,
                        error: 'No temperature zones found for your school',
                    });
                    return;
                }
                zoneId = zones[0].id;
            }
            const stats = await Temperature_1.TemperatureModel.getZoneStats(zoneId);
            const userLastVote = await Temperature_1.TemperatureModel.getUserLastVote(req.user.id, zoneId);
            res.json({
                success: true,
                data: {
                    ...stats,
                    userLastVote,
                },
            });
        }
        catch (error) {
            logger_1.default.error('Error getting temperature stats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get temperature statistics',
            });
        }
    }
    static async getZones(req, res) {
        try {
            const zones = await Temperature_1.TemperatureModel.getZonesBySchool(req.user.schoolId);
            res.json({
                success: true,
                data: zones,
            });
        }
        catch (error) {
            logger_1.default.error('Error getting temperature zones:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get temperature zones',
            });
        }
    }
}
exports.TemperatureController = TemperatureController;
exports.default = TemperatureController;
//# sourceMappingURL=TemperatureController.js.map