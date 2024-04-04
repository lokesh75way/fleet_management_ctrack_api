import express from "express";
import { catchError, validate } from "../middleware/validation";
import { addTrip, getAllTrips, deleteTrip } from "../controllers/Trip";
import asyncHandler from "express-async-handler";

const router = express.Router();

router.post("/", validate("trip:add"), catchError, asyncHandler(addTrip));
// router.put("/:id", validate("trip:update"), catchError, asyncHandler(updateSubAdmin));
router.delete("/:id", asyncHandler(deleteTrip));
router.get("/", asyncHandler(getAllTrips));

export default router;