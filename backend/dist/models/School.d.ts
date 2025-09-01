import { School } from '../types';
export declare class SchoolModel {
    static findAll(): Promise<School[]>;
    static findById(id: string): Promise<School | null>;
    static create(schoolData: {
        name: string;
        address?: string;
        logoUrl?: string;
        timezone?: string;
        settings?: Record<string, any>;
    }): Promise<School>;
    static updateById(id: string, updateData: Partial<School>): Promise<School>;
    static getSchoolStats(schoolId: string): Promise<{
        totalUsers: number;
        totalRequests: number;
        activeRequests: number;
        averageTemperatureVote: number;
    }>;
    private static mapDbSchoolToSchool;
    private static camelToSnake;
}
export default SchoolModel;
//# sourceMappingURL=School.d.ts.map