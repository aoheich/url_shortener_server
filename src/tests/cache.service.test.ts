import { describe, it, expect, vi } from "vitest";
import { deleteCache, getCache, setCache } from "../services/cache.service.js";
import { redisClient } from "../redis/client.js";

vi.mock("../redis/client.js", () => ({
    redisClient: {
        get: vi.fn(),
        setEx: vi.fn(),
        del: vi.fn()
    }
}));

describe("cache service", () => {

    describe("getCache", () => {

        beforeEach(() => {
            vi.clearAllMocks();
        })

        it("should return the cached value", async () => {
            const key = "url:h1h1h";

            vi.mocked(redisClient.get).mockResolvedValue("https://hamza.com");

            await expect(getCache(key)).resolves.toBe("https://hamza.com");

            expect(redisClient.get).toHaveBeenCalledWith(key);
        })

        it("should return null after an error", async () => {
            const key = "url:h1h1h";

            vi.mocked(redisClient.get).mockRejectedValue(new Error("Redis Currently Down"));

            await expect(getCache(key)).resolves.toBe(null);

            expect(redisClient.get).toHaveBeenCalledWith(key);
        })

    })

    describe("setCache", () => {

        it("should set the cached value", async () => {

            const key = "url:h1h1h";
            const value = "http://github.com";

            vi.mocked(redisClient.setEx).mockResolvedValue("OK");

            await expect(setCache(key, value)).resolves.toBe(null);

            expect(redisClient.setEx).toHaveBeenCalledWith(key, 600, value);

        })

        it("should return null after an error", async () => {
            const key = "url:h1h1h";
            const value = "http://github.com";

            vi.mocked(redisClient.setEx).mockRejectedValue(new Error("Redis not available"));

            await expect(setCache(key, value)).resolves.toBe(null);

            expect(redisClient.setEx).toHaveBeenCalledWith(key, 600, value);

        })

    })

    describe("deleteCache", () => {

        it("should delete the cached value", async () => {

            const key = "url:h1h1h";
            
            vi.mocked(redisClient.del).mockResolvedValue(1);

            await expect(deleteCache(key)).resolves.toBe(1);

            expect(redisClient.del).toHaveBeenCalledWith(key);

        })

        it("should resolve to null", async () => {

            const key = "url:h1h1h";
            
            vi.mocked(redisClient.del).mockRejectedValue(new Error("Redis Unavailable"));

            await expect(deleteCache(key)).resolves.toBe(null);

            expect(redisClient.del).toHaveBeenCalledWith(key);

        })

    })

})