import express from "express";
import { catchError, validate } from "../middleware/validation";
import asyncHandler from "express-async-handler";
import { createGeofence, deleteGeofence, getGeofence, getGeofenceById, updateGeofence } from "../controllers/GeoFence";

const router = express.Router();

router.post("/",validate('geofence:add'),catchError,asyncHandler(createGeofence));

router.get("/",asyncHandler(getGeofence));

router.get("/:id",asyncHandler(getGeofenceById))

router.delete("/:id",asyncHandler(deleteGeofence))

router.patch("/:id",validate('geofence:update'),asyncHandler(updateGeofence))

export default router;