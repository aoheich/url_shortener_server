import "dotenv/config"
import { createClient } from "redis"

export const redisClient = createClient({
    url: process.env.REDIS_URL!,
    socket: {
        reconnectStrategy(retries) {
        
            console.log(`Redis connection retry ${retries}`)
            return 5000
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

try {
    await redisClient.connect()
} catch (error) {
    console.error("Error connecting to Redis:", error)
}