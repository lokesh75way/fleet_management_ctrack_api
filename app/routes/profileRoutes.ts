import express from "express";
import asyncHandler from "express-async-handler";
import { getProfile } from "../controllers/Profile";

const router = express.Router();

// get User Profile
router.get("/", asyncHandler(getProfile));

export default router;