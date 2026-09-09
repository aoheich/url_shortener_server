import { Router } from "express";
import { createUrlController, getUrlController, deleteUrlController } from "../controllers/url.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createUrlValidator, deleteUrlValidator, getUrlValidator } from "../validators/validator.js";
import { validateRequest } from "../utils/validation.result.js";


const urlRouter = Router();

urlRouter.post("/",createUrlValidator, validateRequest, asyncHandler(createUrlController));
urlRouter.get("/:shortCode", getUrlValidator, validateRequest, asyncHandler(getUrlController));
urlRouter.delete("/:shortCode", deleteUrlValidator, validateRequest, asyncHandler(deleteUrlController));

export default urlRouter;