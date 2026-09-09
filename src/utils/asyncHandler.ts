import type { NextFunction, Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ParsedQs } from "qs";


export const asyncHandler = <P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = ParsedQs>
    (fn: (req: Request <P, ResBody, ReqBody, ReqQuery>, res: Response, next: NextFunction) => Promise<void>) => 
    
        (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response, next: NextFunction) => {
        
            Promise.resolve(fn(req, res, next)).catch(next)
    }
