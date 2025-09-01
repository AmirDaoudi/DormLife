import { Request, Response } from 'express';
export declare class TemperatureController {
    static getCurrentTemperature(req: Request, res: Response): Promise<void>;
    static submitVote(req: Request, res: Response): Promise<void>;
    static getTemperatureStats(req: Request, res: Response): Promise<void>;
    static getZones(req: Request, res: Response): Promise<void>;
}
export default TemperatureController;
//# sourceMappingURL=TemperatureController.d.ts.map