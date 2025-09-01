import express from 'express';
import { Server } from 'socket.io';
declare class DormLifeServer {
    private app;
    private server;
    private io;
    private port;
    constructor();
    private initializeMiddleware;
    private initializeRoutes;
    private initializeErrorHandling;
    private initializeSocketIO;
    start(): Promise<void>;
    getApp(): express.Application;
    getIO(): Server;
}
export default DormLifeServer;
//# sourceMappingURL=server.d.ts.map