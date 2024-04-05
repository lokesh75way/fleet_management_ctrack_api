import express from "express";
import { catchError, validate } from "../middleware/validation";
import { addAlert, getAllAlerts, deleteAlert, updateAlert, getAlertById } from "../controllers/Alert";
import asyncHandler from "express-async-handler";

const router = express.Router();

router.post("/", validate("alert:add"), catchError, asyncHandler(addAlert));
router.put("/:id", validate("alert:update"), catchError, asyncHandler(updateAlert));
router.delete("/:id", asyncHandler(deleteAlert));
router.get("/", asyncHandler(getAllAlerts));
router.get("/:id",asyncHandler(getAlertById))

export default router;