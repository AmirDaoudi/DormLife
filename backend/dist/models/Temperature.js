"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemperatureModel = void 0;
const connection_1 = require("../database/connection");
const logger_1 = __importDefault(require("../utils/logger"));
class TemperatureModel {
    static async getZonesBySchool(schoolId) {
        try {
            const query = `
        SELECT * FROM temperature_zones 
        WHERE school_id = $1 AND is_active = true
        ORDER BY name ASC
      `;
            const result = await connection_1.db.query(query, [schoolId]);
            return result.rows.map(row => this.mapDbZoneToZone(row));
        }
        catch (error) {
            logger_1.default.error('Error fetching temperature zones:', error);
            throw new Error('Failed to fetch temperature zones');
        }
    }
    static async getZoneById(id) {
        try {
            const query = `
        SELECT * FROM temperature_zones 
        WHERE id = $1 AND is_active = true
      `;
            const result = await connection_1.db.query(query, [id]);
            if (result.rows.length === 0) {
                return null;
            }
            return this.mapDbZoneToZone(result.rows[0]);
        }
        catch (error) {
            logger_1.default.error('Error finding temperature zone:', error);
            throw new Error('Failed to find temperature zone');
        }
    }
    static async canUserVote(userId, zoneId) {
        try {
            const query = `
        SELECT COUNT(*) as count 
        FROM temperature_votes 
        WHERE user_id = $1 AND zone_id = $2 
        AND DATE(created_at) = CURRENT_DATE
      `;
            const result = await connection_1.db.query(query, [userId, zoneId]);
            const count = parseInt(result.rows[0].count);
            return count === 0;
        }
        catch (error) {
            logger_1.default.error('Error checking vote eligibility:', error);
            return false;
        }
    }
    static async submitVote(userId, zoneId, temperature) {
        try {
            // Check if user can vote
            const canVote = await this.canUserVote(userId, zoneId);
            if (!canVote) {
                throw new Error('User has already voted today');
            }
            const query = `
        INSERT INTO temperature_votes (user_id, zone_id, temperature, vote_weight)
        VALUES ($1, $2, $3, 1.0)
        RETURNING *
      `;
            const result = await connection_1.db.query(query, [userId, zoneId, temperature]);
            // Update zone average
            await this.updateZoneAverage(zoneId);
            logger_1.default.info(`Temperature vote submitted: User ${userId}, Zone ${zoneId}, Temp ${temperature}`);
            return this.mapDbVoteToVote(result.rows[0]);
        }
        catch (error) {
            logger_1.default.error('Error submitting temperature vote:', error);
            throw error;
        }
    }
    static async getZoneStats(zoneId) {
        try {
            const statsQuery = `
        SELECT 
          AVG(temperature) as avg_temp,
          COUNT(*) as total_votes,
          COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_votes
        FROM temperature_votes 
        WHERE zone_id = $1
      `;
            const trendQuery = `
        SELECT DATE(created_at) as vote_date, AVG(temperature) as daily_avg
        FROM temperature_votes 
        WHERE zone_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(created_at)
        ORDER BY vote_date ASC
      `;
            const [statsResult, trendResult] = await Promise.all([
                connection_1.db.query(statsQuery, [zoneId]),
                connection_1.db.query(trendQuery, [zoneId])
            ]);
            const stats = statsResult.rows[0];
            const trend = trendResult.rows.map(row => parseFloat(row.daily_avg) || 0);
            return {
                averageVote: parseFloat(stats.avg_temp) || 0,
                totalVotes: parseInt(stats.total_votes) || 0,
                todayVotes: parseInt(stats.today_votes) || 0,
                lastWeekTrend: trend,
            };
        }
        catch (error) {
            logger_1.default.error('Error getting zone stats:', error);
            throw new Error('Failed to get zone statistics');
        }
    }
    static async getUserLastVote(userId, zoneId) {
        try {
            const query = `
        SELECT * FROM temperature_votes 
        WHERE user_id = $1 AND zone_id = $2
        ORDER BY created_at DESC
        LIMIT 1
      `;
            const result = await connection_1.db.query(query, [userId, zoneId]);
            if (result.rows.length === 0) {
                return null;
            }
            return this.mapDbVoteToVote(result.rows[0]);
        }
        catch (error) {
            logger_1.default.error('Error getting user last vote:', error);
            return null;
        }
    }
    static async updateZoneTemperature(zoneId, currentTemp, targetTemp) {
        try {
            const updates = ['current_temperature = $1', 'updated_at = NOW()'];
            const values = [currentTemp];
            let paramCount = 2;
            if (targetTemp !== undefined) {
                updates.push(`target_temperature = $${paramCount}`);
                values.push(targetTemp);
                paramCount++;
            }
            values.push(zoneId);
            const query = `
        UPDATE temperature_zones 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
      `;
            await connection_1.db.query(query, values);
            // Record in history
            const historyQuery = `
        INSERT INTO temperature_history (zone_id, temperature, target_temperature, recorded_at)
        VALUES ($1, $2, $3, NOW())
      `;
            await connection_1.db.query(historyQuery, [zoneId, currentTemp, targetTemp]);
            logger_1.default.debug(`Temperature updated for zone ${zoneId}: ${currentTemp}°F`);
        }
        catch (error) {
            logger_1.default.error('Error updating zone temperature:', error);
            throw new Error('Failed to update temperature');
        }
    }
    static async updateZoneAverage(zoneId) {
        try {
            const avgQuery = `
        SELECT AVG(temperature) as avg_temp
        FROM temperature_votes 
        WHERE zone_id = $1 AND created_at >= NOW() - INTERVAL '24 hours'
      `;
            const result = await connection_1.db.query(avgQuery, [zoneId]);
            const avgTemp = parseFloat(result.rows[0].avg_temp);
            if (!isNaN(avgTemp)) {
                await connection_1.db.query('UPDATE temperature_zones SET target_temperature = $1, updated_at = NOW() WHERE id = $2', [Math.round(avgTemp), zoneId]);
            }
        }
        catch (error) {
            logger_1.default.error('Error updating zone average:', error);
        }
    }
    static mapDbZoneToZone(dbZone) {
        return {
            id: dbZone.id,
            name: dbZone.name,
            description: dbZone.description,
            schoolId: dbZone.school_id,
            currentTemperature: dbZone.current_temperature ? parseFloat(dbZone.current_temperature) : undefined,
            targetTemperature: dbZone.target_temperature ? parseFloat(dbZone.target_temperature) : undefined,
            minTemperature: parseFloat(dbZone.min_temperature),
            maxTemperature: parseFloat(dbZone.max_temperature),
            isActive: dbZone.is_active,
            createdAt: dbZone.created_at,
            updatedAt: dbZone.updated_at,
        };
    }
    static mapDbVoteToVote(dbVote) {
        return {
            id: dbVote.id,
            userId: dbVote.user_id,
            zoneId: dbVote.zone_id,
            temperature: parseFloat(dbVote.temperature),
            voteWeight: parseFloat(dbVote.vote_weight),
            createdAt: dbVote.created_at,
        };
    }
}
exports.TemperatureModel = TemperatureModel;
exports.default = TemperatureModel;
//# sourceMappingURL=Temperature.js.map