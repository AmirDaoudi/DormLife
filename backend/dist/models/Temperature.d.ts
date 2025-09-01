import { TemperatureZone, TemperatureVote } from '../types';
export declare class TemperatureModel {
    static getZonesBySchool(schoolId: string): Promise<TemperatureZone[]>;
    static getZoneById(id: string): Promise<TemperatureZone | null>;
    static canUserVote(userId: string, zoneId: string): Promise<boolean>;
    static submitVote(userId: string, zoneId: string, temperature: number): Promise<TemperatureVote>;
    static getZoneStats(zoneId: string): Promise<{
        averageVote: number;
        totalVotes: number;
        todayVotes: number;
        lastWeekTrend: number[];
    }>;
    static getUserLastVote(userId: string, zoneId: string): Promise<TemperatureVote | null>;
    static updateZoneTemperature(zoneId: string, currentTemp: number, targetTemp?: number): Promise<void>;
    private static updateZoneAverage;
    private static mapDbZoneToZone;
    private static mapDbVoteToVote;
}
export default TemperatureModel;
//# sourceMappingURL=Temperature.d.ts.map