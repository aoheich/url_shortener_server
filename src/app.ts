import express from "express";
import urlRouter from "./routes/url.routes.js";
import { errHandler } from "./utils/errorHandler.js";

const app = express();
app.use(express.json());
app.use("/api/urls", urlRouter);
app.use(errHandler);


export default app;