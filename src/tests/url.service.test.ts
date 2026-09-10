import { createUrl } from "../services/url.service.js";
import prisma from "../prisma/prisma_init.js";
import crypto from "crypto";

vi.mock("../prisma/prisma_init.js", () => ({
    default: {
        url: {
            create: vi.fn()
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
    it("should create a new URL with a short code", async () => {

        const og_url = "wwww.hamza.com"
        const url = {
            id: "hsh1",
            shortCode: "h1h31",
            originalUrl: og_url,
            createdAt: new Date()
        }
        vi.mocked(crypto.randomUUID).mockReturnValue("h1h31-1234-5678-9012-abcdefabcdef");
        vi.mocked(prisma.url.create).mockResolvedValue(url);

        const res = await createUrl(og_url);

        expect(res).toMatchObject({
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

})