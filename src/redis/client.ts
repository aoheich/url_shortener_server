import "dotenv/config"
import { createClient } from "redis"

export const redisClient = createClient({
    url: process.env.REDIS_URL!,
    socket: {
        reconnectStrategy(retries) {
            if(retries >= 3) {
                return new Error("Redis connection failed after 3 retries, giving up")
            } 

            console.log(`Redis connection retry ${retries}`)
            return 1000
        },
    }
}) 

redisClient.on("connect", () => {
    console.log("Redis client connected")
})


redisClient.on("ready", () => { 
    console.log("Redis client ready")
})

redisClient.on("error", (err) => {
    console.error(`Redis client error:`, err)
})

