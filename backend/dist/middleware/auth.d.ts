import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (roles: string | string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const requireVerification: (req: Request, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const rateLimitByUser: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map