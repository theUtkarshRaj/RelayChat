import type { Request, Response, NextFunction } from "express";
import type { IUser } from "../model/user.js";
export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}
export declare const isAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=isauth.d.ts.map