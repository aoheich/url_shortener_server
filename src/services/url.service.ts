import { AppError } from "../errors/appError.js";
import prisma from "../prisma/prisma_init.js";
import crypto from "crypto";
import { deleteCache, getCache, setCache } from "./cache.service.js";

export const createUrl = async (originalUrl: string) => {

    const shortCode = crypto.randomUUID().substring(0,5);

    const url = await prisma.url.create({
        data: {
            originalUrl: originalUrl,
            shortCode: shortCode
        }
    })

    return {
        shortCode: shortCode
    }
} 

export const getUrl = async (shortCode: string) => {
    
    const key = `url:${shortCode}`;
    const cachedUrl = await getCache(key);
   
    if(cachedUrl) { 
        return cachedUrl;
    }

    const url = await prisma.url.findUnique({
        where: {
            shortCode: shortCode
        }
    })
    
    if(!url) {
        throw new AppError("URL not found", 404);
    }

    await setCache(key, url.originalUrl);

    return url.originalUrl;
    
};

export const deleteUrl = async (shortCode: string) => {

    const key = `url:${shortCode}`;

    const url = await prisma.url.findUnique({
        where: {
            shortCode: shortCode
        }
    })
    
    if(!url) {
        throw new AppError("URL not found", 404);
    }

    
    await prisma.url.delete({
        where: {
            shortCode: shortCode
        }
    })

    await deleteCache(key);
   
    return {
        message: "URL deleted successfully"
    }

}