import express from "express";
import passport from "passport";
import asyncHandler from "express-async-handler"
import { catchError, validate } from "../middleware/validation";
import {  createTemplate,  deletePermission,  getAllTemplates, updateFeatureTemplate } from "../controllers/FeatureTemplate";
import { permissionAccess } from "../middleware/featureTemplate";

const router = express.Router();

// to create feature template
router.post('/',validate("module:permission"),catchError,asyncHandler(createTemplate));

// to list all feature templates
router.get("/",catchError , asyncHandler(getAllTemplates));

// to update feature templates
router.patch("/", validate("module:update-permission"),catchError , asyncHandler(updateFeatureTemplate))

// to delete feature templates
router.delete('/:id',catchError, asyncHandler(deletePermission));

export default router;
