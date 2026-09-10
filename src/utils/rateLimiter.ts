import type { NextFunction, Request, Response } from "express";
import { redisClient } from "../redis/client.js";
import { AppError } from "../errors/appError.js";

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const key = `rateLimiter:${ip}`;

    const script = `
        local counter = redis.call("INCR", KEYS[1])
        if counter == 1 then
            redis.call("EXPIRE", KEYS[1], 60)
        end
        return counter
    `
    try {
        const counter = await redisClient.eval(script, {
            keys: [key]
        });

        if (Number(counter) > 5) {
            throw new AppError(
                "Too many requests, please try again later.",
                429
            );
        }
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }

        console.error("Rate limiter Redis error:", error);
    }

    next();
}