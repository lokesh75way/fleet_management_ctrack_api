import express from "express";
import passport from "passport";
import asyncHandler from "express-async-handler";
import { catchError, validate } from "../middleware/validation";
import {
  createBusinessUser,
  updatePassword,
  getAllGroups,
  updateBusinessUser,
  deleteBusinessGroup,
} from "../controllers/BusinessGroup";
import { permissionAccess } from "../middleware/featureTemplate";

const router = express.Router();

// create Business group
router.post(
  "/",
  validate("group:add"),
  catchError,
  asyncHandler(createBusinessUser)
);

// update Business group
router.put(
  "/:id",
  validate("group:update"),
  catchError,
  asyncHandler(updateBusinessUser)
);

// get get all business group
router.get("/" ,asyncHandler(getAllGroups));

// delete Business group
router.delete("/:id", asyncHandler(deleteBusinessGroup));

// change password
router.post(
  "/change-password",
  validate("change:password"),
  catchError,
  asyncHandler(updatePassword)
);

export default router;
