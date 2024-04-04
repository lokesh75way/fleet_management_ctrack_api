import express from "express";
import { catchError, validate } from "../middleware/validation";
import { addTrip } from "../controllers/Trip";
import asyncHandler from "express-async-handler";

const router = express.Router();

router.post("/", validate("trip:add"), catchError, asyncHandler(addTrip));
// router.put("/:id", validate("trip:update"), catchError, asyncHandler(updateSubAdmin));
// router.delete("/:id", asyncHandler(deleteSubAdmin));
// router.get("/", asyncHandler(getAllSubadmin));

export default router;