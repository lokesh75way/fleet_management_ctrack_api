import express from "express";
import asyncHandler from "express-async-handler";
import { fileUploader } from "../controllers/Vehicle";

const router = express.Router();

router.post("/",asyncHandler(fileUploader))

export default router;