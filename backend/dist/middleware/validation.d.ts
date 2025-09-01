import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
export declare const validate: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateQuery: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateParams: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const authSchemas: {
    register: Joi.ObjectSchema<any>;
    login: Joi.ObjectSchema<any>;
    verifyEmail: Joi.ObjectSchema<any>;
    forgotPassword: Joi.ObjectSchema<any>;
    resetPassword: Joi.ObjectSchema<any>;
    refreshToken: Joi.ObjectSchema<any>;
};
export declare const userSchemas: {
    updateProfile: Joi.ObjectSchema<any>;
};
export declare const temperatureSchemas: {
    vote: Joi.ObjectSchema<any>;
};
export declare const requestSchemas: {
    create: Joi.ObjectSchema<any>;
    update: Joi.ObjectSchema<any>;
    comment: Joi.ObjectSchema<any>;
};
export declare const announcementSchemas: {
    create: Joi.ObjectSchema<any>;
    update: Joi.ObjectSchema<any>;
};
export declare const paginationSchema: Joi.ObjectSchema<any>;
export declare const uuidSchema: Joi.ObjectSchema<any>;
//# sourceMappingURL=validation.d.ts.map