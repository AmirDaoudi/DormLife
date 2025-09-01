import { JWTPayload } from '../types';
export declare class JWTUtil {
    private static readonly JWT_SECRET;
    private static readonly JWT_REFRESH_SECRET;
    private static readonly JWT_EXPIRES_IN;
    private static readonly JWT_REFRESH_EXPIRES_IN;
    static generateTokens(payload: JWTPayload): {
        token: string;
        refreshToken: string;
    };
    static verifyToken(token: string): JWTPayload;
    static verifyRefreshToken(refreshToken: string): {
        userId: string;
        email: string;
    };
    static generateVerificationToken(email: string): string;
    static verifyEmailToken(token: string): string;
    static generatePasswordResetToken(userId: string, email: string): string;
    static verifyPasswordResetToken(token: string): {
        userId: string;
        email: string;
    };
    static getTokenFromHeader(authHeader: string | undefined): string | null;
}
export default JWTUtil;
//# sourceMappingURL=jwt.d.ts.map