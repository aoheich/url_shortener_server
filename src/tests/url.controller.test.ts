import Request from "supertest";
import app from "../app.js";
import { createUrl, deleteUrl, getUrl } from "../services/url.service.js";

vi.mock("../services/url.service.js", () => ({
    createUrl: vi.fn(),
    getUrl: vi.fn(),
    deleteUrl: vi.fn()
}));

vi.mock("../utils/rateLimiter.js", () => ({
    rateLimiter: vi.fn((req, res, next) => next())
}));

describe("POST /api/urls", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    })

    it("should respond with a status of 201 and other data", async () => {

        const shortCode = "h1h1h"

        vi.mocked(createUrl).mockResolvedValue({ shortCode })

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

    it("should fail with an internal server error", async () => {

        vi.mocked(createUrl).mockRejectedValue(new Error("Database Unavailable"))

        const res = await Request(app)
            .post("/api/urls")
            .send({
                "originalUrl": "https://hamza.com"
            })


        expect(res.status).toBe(500);
        expect(res.body).toMatchObject({
            message: "Internal Server Error"
        })
        expect(createUrl).toHaveBeenCalledWith("https://hamza.com");
    })

    it("should reject a request with an invalid body", async () => {

        const res = await Request(app)
            .post("/api/urls")
            .send({
                "url": "https://hamza.com"
            })


        expect(res.status).toBe(400)
        expect(res.body).toMatchObject({
            message: expect.stringContaining("originalUrl is required")
        })

        expect(createUrl).not.toHaveBeenCalled();

    })

    
})

describe("GET /api/urls/:shortcode", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })


    it("should redirect to the original url", async () => {

        const shortCode = "h1h1h";

        vi.mocked(getUrl).mockResolvedValue("https://hamza.com");

        const res = await Request(app)
            .get("/api/urls/h1h1h")


        expect(res.status).toBe(302);
        expect(res.headers.location).toBe("https://hamza.com");

        expect(getUrl).toHaveBeenCalledWith(shortCode)
    })

    it("should return an error when database isn't available", async () => {

        const shortCode = "h1h1h";

        vi.mocked(getUrl).mockRejectedValue(new Error("Database Unavailable"));

        const res = await Request(app)
            .get("/api/urls/h1h1h")


        expect(res.status).toBe(500);
        expect(res.body).toMatchObject({
            message: "Internal Server Error"
        })

        expect(getUrl).toHaveBeenCalledWith(shortCode);
    })
})

describe("DELETE /api/urls/:shortcode", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    })

    it("should successfully delete the url", async () => {

        const shortCode = "h1h1h";

        vi.mocked(deleteUrl).mockResolvedValue({
            message: "URL deleted successfully"
        })

        const res = await Request(app)
            .delete("/api/urls/h1h1h")

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            message: "URL deleted successfully"
        })

        expect(deleteUrl).toHaveBeenCalledWith(shortCode);

    })

    it("should return an internal server error", async () => {

        const shortCode = "h1h1h";

        vi.mocked(deleteUrl).mockRejectedValue(new Error("some error occured"))

        const res = await Request(app)
            .delete("/api/urls/h1h1h")

        expect(res.status).toBe(500);
        expect(res.body).toMatchObject({
            message: "Internal Server Error"
        })

        expect(deleteUrl).toHaveBeenCalledWith(shortCode);

    })

})