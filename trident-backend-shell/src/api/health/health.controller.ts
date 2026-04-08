import { Request, Response } from 'express';

export const healthController = {
    status: (req: Request, res: Response) => {
        res.json({ status: "ok", timestamp: Date.now() });
    }
};
