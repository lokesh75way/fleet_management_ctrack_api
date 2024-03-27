import express from "express";
import createHttpError from "http-errors";

import { catchError, validate } from "../middleware/validation";
import { createCompany } from "../controllers/Company";
import asyncHandler from "express-async-handler";
import {
  createDriver,
  deleteDrivers,
  getDriver,
  updateDriver,
} from "../controllers/Driver";
import Driver from "../schema/Driver";
import { createResponse } from "../helper/response";

const router = express.Router();

router.post("/", asyncHandler(createCompany));

router.post(
  "/driver",
  validate("driver:add"),
  catchError,
  asyncHandler(createDriver)
);

router.put(
  "/driver/:id",
  validate("id:mongoId"),
  validate("driver:update"),
  catchError,
  asyncHandler(updateDriver)
);

router.get(
  "/driver",
  asyncHandler(async (req, res) => {
    const drivers = await Driver.find({}, null)
      .populate("companyId")
      .populate("branchId")
      .populate("businessGroupId");

    res.send(createResponse({ drivers }, "All drivers"));
  })
);

router.get(
  "/driver/:id",
  validate("id:mongoId"),
  catchError,
  asyncHandler(getDriver)
);

router.delete(
  "/driver",
  validate("driver:delete"),
  catchError,
  asyncHandler(deleteDrivers)
);

export default router;