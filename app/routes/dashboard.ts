import express from "express";
import { catchError, validate } from "../middleware/validation";
import { getFleetStatus, getFleetUsage, getFleetFuel, getOverspeed, getMaintainanceReminder, getRenewalReminder, fleetIdle, getTasks, getAllTechnicianTasks } from "../controllers/Dashboard";
import asyncHandler from "express-async-handler";

const router = express.Router();


router.get("/fleet-status", asyncHandler(getFleetStatus));
router.get("/fleet-usage", asyncHandler(getFleetUsage));
router.get("/fleet-fuel", asyncHandler(getFleetFuel));
router.get("/overspeed", asyncHandler(getOverspeed));
router.get("/maintainance-reminder", asyncHandler(getMaintainanceReminder));
router.get("/renewal-reminder", asyncHandler(getRenewalReminder));
router.get("/fleet-idle", asyncHandler(fleetIdle));
router.get("/tasks", asyncHandler(getTasks));
router.get("/tasks-data", asyncHandler(getAllTechnicianTasks))



export default router;