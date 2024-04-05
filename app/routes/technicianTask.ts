import express from "express";

import { catchError, validate } from "../middleware/validation";
import asyncHandler from "express-async-handler";
import { createTechnicianTask, deleteTechnicianTask, getTechnicianTasks, getTechnicianTasksById, updateTechnicianTasks } from "../controllers/TechnicianTask";

const router = express.Router();

router.post("/", validate("task:create") , catchError , asyncHandler(createTechnicianTask));

router.delete("/:id", validate("id:mongoId"), catchError,asyncHandler(deleteTechnicianTask))

router.get("/", catchError , asyncHandler(getTechnicianTasks))

router.patch("/:id", validate("id:mongoId"), validate("task:update"), catchError , asyncHandler(updateTechnicianTasks))

router.get('/:id', validate("id:mongoId"), catchError, asyncHandler(getTechnicianTasksById))

export default router;
