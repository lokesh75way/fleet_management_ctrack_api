import express from "express";
import asyncHandler from "express-async-handler"
import { catchError, validate } from "../middleware/validation";
import { } from "../controllers/BusinessGroup";
import { createCompanyBranch, getAllBranch } from "../controllers/Branch";

const router = express.Router();

// create company branch
router.post("/", validate("branch:add"), catchError, asyncHandler(createCompanyBranch));

// update company branch
// router.patch('/', validate("group:update"), catchError , asyncHandler())

// get get all company branch
router.get('/',catchError,asyncHandler(getAllBranch))

// delete company branch
// router.delete('/:id',catchError, asyncHandler())


export default router;