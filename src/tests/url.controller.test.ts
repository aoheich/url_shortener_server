import Request from "supertest";
import app from "../app.js";
import { createUrl } from "../services/url.service.js";

vi.mock("../services/url.service.js", () => ({
    createUrl: vi.fn(),
    getUrl: vi.fn(),
    deleteUrl: vi.fn()
}));

vi.mock("../utils/rateLimiter.js", () => ({
    rateLimiter: vi.fn()
}));

describe("POST /api/urls", () => {
    
    it.only("should respond with a status of 201 and other data", async () => {

        const shortCode = "h1h1h"

        vi.mocked(createUrl).mockResolvedValue({shortCode})

        const res = await Request(app)
        .post("/api/urls")
        .send({
            "originalUrl": "https://hamza.com"
        })

       
        expect(res.status).toBe(201)
        expect(res.body).toMatchObject({
            message: "URL created successfully",
            data: { 
                shortCode: "h1h1h"
            }
        })

        expect(createUrl).toHaveBeenCalledWith("https://hamza.com");
    })
})