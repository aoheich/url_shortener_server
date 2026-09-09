import { AppError } from "../errors/appError.js";
import prisma from "../prisma/prisma_init.js";
import crypto from "crypto";

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
    const url = await prisma.url.findUnique({
        where: {
            shortCode: shortCode
        }
    })
    
    if(!url) {
        throw new AppError("URL not found", 404);
    }

    return url;
    
};

export const deleteUrl = async (shortCode: string) => {

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

   
    return {
        message: "URL deleted successfully"
    }

}