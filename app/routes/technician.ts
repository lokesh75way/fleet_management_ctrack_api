import express from "express";

import { catchError, validate } from "../middleware/validation";
import asyncHandler from "express-async-handler";
import { createTechnician, deleteTechnician, getTechnician, getTechnicianById, updateTechnician } from "../controllers/Technician";

const router = express.Router();

router.post("/", validate("technician:create") , catchError , asyncHandler(createTechnician));

router.delete("/:id",catchError,asyncHandler(deleteTechnician))

router.get("/", catchError , asyncHandler(getTechnician))

router.patch("/:id",validate("technician:update"), catchError , asyncHandler(updateTechnician))

router.get('/:id',catchError, asyncHandler(getTechnicianById))

export default router;
