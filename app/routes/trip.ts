import express from "express";
import { catchError, validate } from "../middleware/validation";
import { addTrip, getAllTrips, deleteTrip, getTripById, updateTrip } from "../controllers/Trip";
import asyncHandler from "express-async-handler";

const router = express.Router();

router.post("/", validate("trip:add"), catchError, asyncHandler(addTrip));
router.patch("/:id",validate("trip:update"), catchError, asyncHandler(updateTrip));
// router.put("/:id", validate("trip:update"), catchError, asyncHandler(updateSubAdmin));
router.delete("/:id", asyncHandler(deleteTrip));
router.get("/", asyncHandler(getAllTrips));
router.get("/:id", asyncHandler(getTripById));

export default router;