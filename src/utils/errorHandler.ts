import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/appError.js";

export const errHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    
    if (err instanceof AppError) {
        return res.status(err.code).json({
            message: err.message
        })
    }

    console.log(err)
    res.status(500).json({ message: "Internal Server Error" });
  
};