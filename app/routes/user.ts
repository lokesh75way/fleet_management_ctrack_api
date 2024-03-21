import express from "express";
import passport from "passport";
import { catchError, validate } from "../middleware/validation";
import { addSubAdmin, deleteSubAdmin, getAllSubadmin, updateSubAdmin } from "../controllers/User";
import asyncHandler from "express-async-handler";

const router = express.Router();

router.post("/", validate("subadmin:add"), catchError, asyncHandler(addSubAdmin));
router.put("/:id", validate("subadmin:update"), catchError, asyncHandler(updateSubAdmin));
router.delete("/:id", asyncHandler(deleteSubAdmin));
router.get("/", asyncHandler(getAllSubadmin));

export default router;