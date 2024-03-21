import express from "express";
import passport from "passport";
import { catchError, validate } from "../middleware/validation";
import { createCompany } from "../controllers/Company";
import asyncHandler from "express-async-handler"

const router = express.Router();

router.post("/", asyncHandler(createCompany));
export default router;