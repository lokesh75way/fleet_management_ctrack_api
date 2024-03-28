import express from "express";
import { catchError, validate } from "../middleware/validation";
import asyncHandler from "express-async-handler";
import { createVehicle, deleteVehicle, fileUploader, getVehicles, updateVehicle } from "../controllers/Vehicle";

const router = express.Router();

router.post("/", validate("vehicle:add"), catchError, asyncHandler(createVehicle));

router.get("/",catchError , asyncHandler(getVehicles))

router.patch("/:id", validate("vehicle:update"), catchError, asyncHandler(updateVehicle));

router.delete("/:id", asyncHandler(deleteVehicle));

router.post("/file-upload",asyncHandler(fileUploader))

export default router;