import { redisClient } from "../redis/client.js";


export const getCache = async (key: string) => {
    try {
        const res = await redisClient.get(key); 
        return res;
    } catch (error) {
        return null;
    }
}

export const setCache = async (key: string, value: string) => {
    
    try {
        
        await redisClient.setEx(key, 600, value);
        return null
    
    } catch (error) {
        return null;
    }
    
}

export const deleteCache = async (key: string) => {
    try {
        await redisClient.del(key);
        return 1
    } catch (error) {
        return null
    }
}
