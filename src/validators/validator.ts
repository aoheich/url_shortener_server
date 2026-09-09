import { body, param } from "express-validator";

export const createUrlValidator = [
    body("originalUrl")
    .exists().withMessage("originalUrl is required")
    .trim()
    .isURL().withMessage("originalUrl must be a valid URL")
    .isLength({ max: 2048 }).withMessage("originalUrl must be less than 2048 characters")
]

export const getUrlValidator = [
    param("shortCode")
    .exists().withMessage("shortCode is required")
    .trim()
    .isLength({ min: 5, max: 5 }).withMessage("shortCode must be exactly 5 characters long")
]

export const deleteUrlValidator = [
    param("shortCode")
    .exists().withMessage("shortCode is required")
    .trim()
    .isLength({ min: 5, max: 5 }).withMessage("shortCode must be exactly 5 characters long")
]