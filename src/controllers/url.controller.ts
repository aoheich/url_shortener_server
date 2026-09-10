import type { NextFunction, Request, Response } from "express";
import { createUrl, deleteUrl, getUrl } from "../services/url.service.js";
import type { responseType } from "../types/response.type.js";


export const createUrlController = async (req: Request<{},{},{originalUrl: string}>, res: Response<responseType<{ shortCode: string }>>, next: NextFunction) => {

    const { shortCode } = await createUrl(req.body.originalUrl);

    res.status(201).json({
        message: "URL created successfully",
        data: {
            shortCode
        }
    });
}

export const getUrlController = async (req: Request<{shortCode: string}>, res: Response, next: NextFunction) => {

    const url = await getUrl(req.params.shortCode); 

    res.redirect(302,url);
}

export const deleteUrlController = async (req: Request<{shortCode: string}>, res: Response<{message: string}>, next: NextFunction) => {

    const response = await deleteUrl(req.params.shortCode);
    res.status(200).json(response);
}