import express from "express";
import asyncHandler from "express-async-handler"
import { catchError, validate } from "../middleware/validation";
import { } from "../controllers/BusinessGroup";
import {
  createCompanyBranch,
  deleteBranch,
  getAllBranch,
  updateBranch,
  getBranchById,
} from "../controllers/Branch";

const router = express.Router();

// create company branch
router.post("/", validate("branch:add"), catchError, asyncHandler(createCompanyBranch));

// get get all company branch
router.get('/',catchError,asyncHandler(getAllBranch))

// update company branch
router.put(
  "/:id",
  validate("branch:update"),
  catchError,
  asyncHandler(updateBranch)
);

router.get("/:id", asyncHandler(getBranchById));

// delete company branch
router.delete('/:id',catchError, asyncHandler(deleteBranch))


export default router;