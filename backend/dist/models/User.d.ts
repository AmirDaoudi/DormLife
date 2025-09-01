import { User } from '../types';
export declare class UserModel {
    static create(userData: {
        email: string;
        password: string;
        fullName: string;
        schoolId: string;
        role?: string;
    }): Promise<User>;
    static findByEmail(email: string): Promise<User | null>;
    static findById(id: string): Promise<User | null>;
    static updateById(id: string, updateData: Partial<User>): Promise<User>;
    static updateLastLogin(id: string): Promise<void>;
    static verifyPassword(user: User, password: string): Promise<boolean>;
    static setVerificationToken(email: string, token: string): Promise<void>;
    static verifyEmail(token: string): Promise<User | null>;
    static setResetToken(email: string, token: string, expires: Date): Promise<void>;
    static resetPassword(token: string, newPassword: string): Promise<User | null>;
    static findBySchool(schoolId: string, limit?: number, offset?: number): Promise<User[]>;
    private static mapDbUserToUser;
    private static camelToSnake;
}
export default UserModel;
//# sourceMappingURL=User.d.ts.map