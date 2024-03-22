import express from "express";
import passport from "passport";
import asyncHandler from "express-async-handler"
import { catchError, validate } from "../middleware/validation";
import { createBusinessUser, deleteBusinessGroup, getAllGroups, updateBusinessUser } from "../controllers/BusinessGroup";

const router = express.Router();

// create Business group
router.post("/", validate("group:add"), catchError, asyncHandler(createBusinessUser));

// update Business group 
router.patch('/update', validate("group:update"), catchError , asyncHandler(updateBusinessUser))

// delete Business group
router.patch('/delete/:id',catchError, asyncHandler(deleteBusinessGroup))

router.get('/get',catchError,asyncHandler(getAllGroups))

export default router;