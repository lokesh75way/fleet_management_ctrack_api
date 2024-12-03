import express from "express";

import { catchError, validate } from "../middleware/validation";

import {
  createCompany,
  getAllCompanies,
  updateCompanyUser,
  deleteCompany,
  updatePassword,
  getCompanyById,
} from "../controllers/Company";
import asyncHandler from "express-async-handler";
import Company from "../schema/Company";

const router = express.Router();

// create company
router.post(
  "/",
  validate("company:add"),
  catchError,
  asyncHandler(createCompany)
);

// get company
router.get("/", catchError, asyncHandler(getAllCompanies));

// update company
router.put(
  "/:id",
  validate("company:update"),
  catchError,
  asyncHandler(updateCompanyUser)
);

// delete Business group
router.delete("/:id", catchError, asyncHandler(deleteCompany));

// company by id
router.get("/:id", asyncHandler(getCompanyById));

// change password
router.post(
  "/change-password",
  validate("change:password"),
  catchError,
  asyncHandler(updatePassword)
);

export default router;
