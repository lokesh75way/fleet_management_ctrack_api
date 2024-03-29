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

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const drivers = await Driver.find({}, null)
      .populate("companyId")
      .populate("branchId")
      .populate("businessGroupId");

    res.send(createResponse(drivers, "All drivers"));
  })
);

router.get("/:id", validate("id:mongoId"), catchError, asyncHandler(getDriver));

router.delete(
  "/",
  validate("driver:delete"),
  catchError,
  asyncHandler(deleteDrivers)
);

export default router;
