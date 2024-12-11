import express from "express";
import passport from "passport";
import {
  adminLogin,
  changePassword,
  adminRegister,
  forgetPassword,
  resetPassword,
  profileUpdate,
} from "../controllers/Authentication";
import { catchError, validate } from "../middleware/validation";
import asyncHandler from "express-async-handler";

const router = express.Router();

router.post("/register", asyncHandler(adminRegister));
router.post(
  "/login",
  validate("user:login"),
  catchError,
  passport.authenticate("login", { session: false }),
  asyncHandler(adminLogin)
);
router.put(
  "/change-password",
  validate("user:password"),
  catchError,
  passport.authenticate("jwt", { session: false }),
  asyncHandler(changePassword)
);
router.put(
  "/profile",
  validate("user:update"),
  catchError,
  passport.authenticate("jwt", { session: false }),
  asyncHandler(profileUpdate)
);
router.post(
  "/forgot-password",
  validate("user:forgotpassword"),
  catchError,
  asyncHandler(forgetPassword)
);
router.put(
  "/reset-password",
  validate("user:resetpassword"),
  catchError,
  asyncHandler(resetPassword)
);

export default router;
