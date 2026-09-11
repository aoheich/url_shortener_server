import { createUrl, deleteUrl, getUrl } from "../services/url.service.js";
import prisma from "../prisma/prisma_init.js";
import crypto from "crypto";
import { deleteCache, getCache, setCache } from "../services/cache.service.js";

vi.mock("../prisma/prisma_init.js", () => ({
    default: {
        url: {
            findUnique: vi.fn(),
            create: vi.fn(),
            delete: vi.fn()
        }
    }
}))

vi.mock("crypto", () => ({
    default: {
        randomUUID: vi.fn()
    }
}))

vi.mock("../services/cache.service.js", () => ({
    getCache: vi.fn(),
    setCache: vi.fn(),
    deleteCache: vi.fn()
}))

describe("createUrl", () => {

    beforeEach(() => {
        vi.clearAllMocks()

    })

    it("should create a new URL with a short code", async () => {

        const og_url = "https//:wwww.hamza.com"
        const url = {
            id: "hsh1",
            shortCode: "h1h31",
            originalUrl: og_url,
            createdAt: new Date()
        }
        vi.mocked(crypto.randomUUID).mockReturnValue("h1h31-1234-5678-9012-abcdefabcdef");
        vi.mocked(prisma.url.create).mockResolvedValue(url);

        await expect(createUrl(og_url)).resolves.toMatchObject({
            shortCode: "h1h31"
        })

        expect(prisma.url.create).toHaveBeenCalledWith({
            data: {
                originalUrl: og_url,
                shortCode: "h1h31"
            }
        })


        expect(crypto.randomUUID).toHaveBeenCalledOnce();
    })

    it("should fail and return a prisma error", async () => {

        const og_url = "https//:wwww.hamza.com"

        vi.mocked(crypto.randomUUID).mockReturnValue("h1h31-1234-5678-9012-abcdefabcdef");
        vi.mocked(prisma.url.create).mockRejectedValue(new Error("Database Unavailable"));


        await expect(createUrl(og_url)).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Database Unavailable]`);

        expect(prisma.url.create).toHaveBeenCalledWith({
            data: {
                originalUrl: og_url,
                shortCode: "h1h31"
            }
        })
        expect(crypto.randomUUID).toHaveBeenCalledOnce();
    })

})

describe("getUrl", () => {

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("should return the cached URL when found", async () => {

        const shortCode = "h1h1h";

        vi.mocked(getCache).mockResolvedValue("https://www.hamza.com");

        await expect(getUrl(shortCode)).resolves.toBe("https://www.hamza.com")

        expect(prisma.url.findUnique).not.toHaveBeenCalled();
        expect(setCache).not.toHaveBeenCalledWith();



    })

    it("should fetch from database when cache misses", async () => {

        const shortCode = "h1h1h";

        const url = {
            id: "hsh1",
            shortCode: "h1h1h",
            originalUrl: "https://www.hamza.com",
            createdAt: new Date()
        }

        vi.mocked(getCache).mockResolvedValue(null);
        vi.mocked(prisma.url.findUnique).mockResolvedValue(url);

        await expect(getUrl(shortCode)).resolves.toBe("https://www.hamza.com");

        expect(prisma.url.findUnique).toHaveBeenCalledWith({
            where: {
                shortCode: shortCode
            }
        })
        expect(getCache).toHaveBeenCalledWith("url:h1h1h");
        expect(setCache).toHaveBeenCalledWith("url:h1h1h", "https://www.hamza.com");

    })

    it("should return an error when url does not exist at all", async () => {

        const shortCode = "h1h1h";

        vi.mocked(getCache).mockResolvedValue(null);
        vi.mocked(prisma.url.findUnique).mockResolvedValue(null);

        await expect(getUrl(shortCode)).rejects.toMatchObject({
            message: "URL not found",
            code: 404
        })
        expect(prisma.url.findUnique).toHaveBeenCalledWith({
            where: {
                shortCode: shortCode
            }
        })
        expect(getCache).toHaveBeenCalledWith("url:h1h1h");
        expect(setCache).not.toHaveBeenCalled();


    })

    it("should return an error because cache misses and database is unavailable", async () => {

        const shortCode = "h1h1h"

        vi.mocked(getCache).mockResolvedValue(null);
        vi.mocked(prisma.url.findUnique).mockRejectedValue(
            new Error("Database Unavailable")
        );

        await expect(getUrl(shortCode)).rejects.toThrow("Database Unavailable")

         expect(prisma.url.findUnique).toHaveBeenCalledWith({
            where: {
                shortCode: shortCode
            }
        })
        expect(getCache).toHaveBeenCalledWith("url:h1h1h");
        expect(setCache).not.toHaveBeenCalled();



    })


})

describe("deleteUrl", () => {

    beforeEach(() => {
        vi.clearAllMocks()
    })    

    it("should delete the url successfully from db and redis ", async () => {
        
        const shortCode = "h1h1h";

        const url = {
            id: "hsh1",
            shortCode: "h1h1h",
            originalUrl: "https://github.aoheich",
            createdAt: new Date()
        }
        vi.mocked(prisma.url.findUnique).mockResolvedValue(url);
        vi.mocked(prisma.url.delete).mockResolvedValue(url);

        await expect(deleteUrl(shortCode)).resolves.toMatchObject({
            message: "URL deleted successfully"
        })

        expect(deleteCache).toHaveBeenCalledWith("url:h1h1h");
        expect(prisma.url.findUnique).toHaveBeenCalledWith({
            where: {
                shortCode: shortCode
            }
        })

        expect(prisma.url.delete).toHaveBeenCalledWith({
            where: {
                shortCode: shortCode
            }
        })

    })

    it("should return 404 when URL does not exist", async () => {

        const shortCode = "h1h1h";

        vi.mocked(prisma.url.findUnique).mockResolvedValue(null);

        await expect(deleteUrl(shortCode)).rejects.toMatchObject({
            message: "URL not found",
            code: 404
        })

        expect(prisma.url.findUnique).toHaveBeenCalledWith({
            where: {
                shortCode: shortCode
            }
        })

        expect(prisma.url.delete).not.toHaveBeenCalled()
        expect(deleteCache).not.toHaveBeenCalled()

    })

    it("should return an error when db fails abrubtly", async () => {

        const shortCode = "h1h1h";

        const url = {
            id: "hsh1",
            shortCode: "h1h1h",
            originalUrl: "https://github.aoheich",
            createdAt: new Date()
        }
        vi.mocked(prisma.url.findUnique).mockResolvedValue(url);
        vi.mocked(prisma.url.delete).mockRejectedValue(new Error("Database Unavailable"));

        await expect(deleteUrl(shortCode)).rejects.toThrow("Database Unavailable");

        expect(prisma.url.findUnique).toHaveBeenCalledWith({
            where: {
                shortCode: shortCode
            }
        })

        expect(prisma.url.delete).toHaveBeenCalledWith({
            where: {
                shortCode: shortCode
            }
        })

        expect(deleteCache).not.toHaveBeenCalled()

    })

})