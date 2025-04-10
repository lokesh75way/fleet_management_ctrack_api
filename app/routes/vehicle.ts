import express from "express";
import { catchError, validate } from "../middleware/validation";
import asyncHandler from "express-async-handler";
import { createVehicle, deleteVehicle, fileUploader, getCompanyVehicles, getUnAssinedVehicles, getVehicleTrackings, getVehicles, updateVehicle, getVehicleById } from "../controllers/Vehicle";

const router = express.Router();

router.post("/", validate("vehicle:add"), catchError, asyncHandler(createVehicle));

router.get("/" , asyncHandler(getVehicles))

router.get('/tracking',asyncHandler(getVehicleTrackings));

router.get('/list',asyncHandler(getCompanyVehicles));

router.patch("/:id", validate("vehicle:update"), catchError, asyncHandler(updateVehicle));

router.delete("/:id", asyncHandler(deleteVehicle));

router.get("/unassigned" , asyncHandler(getUnAssinedVehicles))

router.get("/:id", asyncHandler(getVehicleById));

export default router;