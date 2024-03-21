import express from "express";
import passport from "passport";
import asyncHandler from "express-async-handler"
import { catchError, validate } from "../middleware/validation";
import { createBusinessUser } from "../controllers/BusinessGroup";

const router = express.Router();

router.post("/", validate("group:add"), catchError, asyncHandler(createBusinessUser));

export default router;