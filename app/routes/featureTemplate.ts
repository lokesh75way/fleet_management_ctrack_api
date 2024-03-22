import express from "express";
import passport from "passport";
import asyncHandler from "express-async-handler"
import { catchError, validate } from "../middleware/validation";
import {  createTemplate,  getAllTemplates } from "../controllers/FeatureTemplate";

const router = express.Router();

// to create feature template
router.post('/',validate("module:permission"),catchError,asyncHandler(createTemplate));

// to list all feature templates
router.get("/", catchError , asyncHandler(getAllTemplates));

export default router;