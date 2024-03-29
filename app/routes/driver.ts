import { createCompany } from "../controllers/Company";
import asyncHandler from "express-async-handler";
import {
  createDriver,
  deleteDrivers,
  getAllDrivers,
  getDriver,
  updateDriver,
} from "../controllers/Driver";
import Driver from "../schema/Driver";
import { createResponse } from "../helper/response";
import { catchError, validate } from "../middleware/validation";
import express from "express";
const router = express.Router();

router.post(
  "/",
  validate("driver:add"),
  catchError,
  asyncHandler(createDriver)
);

router.put(
  "/:id",
  validate("id:mongoId"),
  validate("driver:update"),
  catchError,
  asyncHandler(updateDriver)
);

router.get("/", asyncHandler(getAllDrivers));

router.get("/:id", validate("id:mongoId"), catchError, asyncHandler(getDriver));

router.delete(
  "/",
  validate("driver:delete"),
  catchError,
  asyncHandler(deleteDrivers)
);

export default router;
