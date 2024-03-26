import express from "express";
import passport from "passport";
import asyncHandler from "express-async-handler"
import { catchError, validate } from "../middleware/validation";
import { createBusinessUser, deleteBusinessGroup, getAllGroups, updateBusinessUser } from "../controllers/BusinessGroup";

const router = express.Router();

// create Business group
router.post("/", validate("group:add"), catchError, asyncHandler(createBusinessUser));

// update Business group 
router.patch('/', validate("group:update"), catchError , asyncHandler(updateBusinessUser))

// get get all business group
router.get('/',catchError,asyncHandler(getAllGroups))

// delete Business group
router.delete('/:id',catchError, asyncHandler(deleteBusinessGroup))


export default router;