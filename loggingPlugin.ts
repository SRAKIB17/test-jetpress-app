// loggingPlugin.ts
import { Request, Response } from "jetpress";

export function loggingPlugin(req: Request, res: Response, next: () => void) {
    console.log(`${req.method} ${req.url}`);
    next();
}
