import { rateLimiter } from "../utils/rateLimiter.js";
import { redisClient } from "../redis/client.js";


vi.mock("../redis/client.js", () => ({
    redisClient: {
        eval: vi.fn()
    }
}))


describe("rateLimiter", () => {
    
    it("should call next without throwing an error", async () => {

        const ip = "192.168.1.68"; 

        const req = {
            ip: ip,
        } as any

        const res = {} as any;
        const next = vi.fn();

        const key = `rateLimiter:${ip}`;

        vi.mocked(redisClient.eval).mockResolvedValue(2);

        await rateLimiter(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(redisClient.eval).toHaveBeenCalledWith(expect.any(String),{
            keys: [key]
        })
       
    })

    it("should reject when the rate limit is exceeded", async () => {
        const ip = "192.168.1.68"; 

        const req = {
            ip: ip,
        } as any

        const res = {} as any;
        const next = vi.fn();

        const key = `rateLimiter:${ip}`;

        vi.mocked(redisClient.eval).mockResolvedValue(6);

        await expect(rateLimiter(req, res, next)).rejects.toMatchObject({
            message: "Too many requests, please try again later.",
            code: 429
        });
        
        expect(next).not.toHaveBeenCalled();
        expect(redisClient.eval).toHaveBeenCalledWith(expect.any(String),{
            keys: [key]
        })
    })

    it("should continue operations when a Redis is Unavailable", async () => {

        const ip = "192.168.1.68"; 

        const req = {
            ip: ip,
        } as any

        const res = {} as any;
        const next = vi.fn();

        const key = `rateLimiter:${ip}`;

        vi.mocked(redisClient.eval).mockRejectedValue(new Error("Redis Unavailable"));

        await rateLimiter(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(redisClient.eval).toHaveBeenCalledWith(expect.any(String), {
            keys: [key]
        })

    })
})

