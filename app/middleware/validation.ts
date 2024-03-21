import { type Response, type Request, type NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import { check, validationResult } from "express-validator";
import createHttpError from "http-errors";
import { UserRole } from "../schema/User";

export const validate = (validationName: string): any[] => {
  switch (validationName) {
    case "users:login": {
      return [
        check("email")
          .exists({ values: "falsy" })
          .notEmpty()
          .bail()
          .withMessage("Email is required")
          .isEmail()
          .bail()
          .withMessage("Enter valid email"),
        check("password")
          .exists({ values: "falsy" })
          .notEmpty()
          .bail()
          .withMessage("Password is required"),
      ];
    }
    case "users:signup": {
      return [
        check("email")
          .exists({ values: "falsy" })
          .notEmpty()
          .bail()
          .withMessage("Email is required")
          .isEmail()
          .bail()
          .withMessage("Enter valid email"),
        check("name")
          .exists({ values: "falsy" })
          .notEmpty()
          .bail()
          .withMessage("Name is required"),
        check("password")
          .exists({ values: "falsy" })
          .notEmpty()
          .bail()
          .withMessage("Password is required")
          .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          })
          .bail()
          .withMessage("Enter strong password"),
      ];
    }
    case "users:update": {
      return [
        check("email").optional(),
        check("name").optional(),
        check("active").optional().isBoolean(),
      ];
    }

    case "admin:register": {
      return [
        check("email")
          .exists({ values: "falsy" })
          .notEmpty()
          .bail()
          .withMessage("Email is required")
          .isEmail()
          .bail()
          .withMessage("Enter valid email"),
        check("password")
          .exists({ values: "falsy" })
          .notEmpty()
          .bail()
          .withMessage("Password is required")
          .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          }),
        check("name")
          .exists({ values: "falsy" })
          .notEmpty()
          .bail()
          .withMessage("Name is required"),
        check("role")
          .exists({ values: "falsy" })
          .notEmpty()
          .bail()
          .withMessage("Role is required")
          .isIn(Object.values(UserRole))
          .withMessage("Invalid role"),
      ];
    }

    case "admin:login": {
      return [
        check("email")
          .exists({ values: "falsy" })
          .notEmpty()
          .bail()
          .withMessage("Email is required")
          .isEmail()
          .bail()
          .withMessage("Enter valid email"),
        check("password")
          .exists({ values: "falsy" })
          .notEmpty()
          .bail()
          .withMessage("Password is required"),
      ];
    }

    case "subadmin:add": {
      return [
        check("email")
          .exists({ values: "falsy" })
          .notEmpty()
          .bail()
          .withMessage("Email is required")
          .isEmail()
          .bail()
          .withMessage("Enter valid email"),
      ];
    }

    case "user:update": {
      return [
        check("email")
          .notEmpty()
          .bail()
          .withMessage("Email is required")
          .isEmail()
          .bail()
          .withMessage("Enter valid email"),
        check("firstName").notEmpty().bail().withMessage("First name is required"),
        check("lastName").notEmpty().bail().withMessage("Last name is required"),
      ];
    }

    case "user:password": {
      return [
        check("password")
          .exists({ values: "falsy" })
          .notEmpty()
          .bail()
          .withMessage("Current password is required"),
        check("newPassword")
          .exists({ values: "falsy" })
          .notEmpty()
          .bail()
          .withMessage("New password is required"),
      ];
    }

    case "user:forgotpassword": {
      return [
        check("email")
          .exists()
          .notEmpty()
          .bail()
          .withMessage("Email is required")
          .isEmail()
          .bail()
          .withMessage("Enter valid email"),
      ];
    }

    case "user:resetpassword": {
      return [
        check("token")
          .exists({ values: "falsy" })
          .notEmpty()
          .bail()
          .withMessage("Token is required"),
        check("password")
          .exists({ values: "falsy" })
          .notEmpty()
          .bail()
          .withMessage("New password is required"),
      ];
    }

    case "user:permission": {
      return [
        check("role")
          .exists({ values: "falsy" })
          .notEmpty()
          .bail()
          .withMessage("Role is required"),
        check("endPoint")
          .exists({ values: "falsy" })
          .notEmpty()
          .bail()
          .withMessage("EndPoint is required"),
        check("method")
          .exists({ values: "falsy" })
          .notEmpty()
          .bail()
          .withMessage("Method is required"),
      ];
    }
  

    default:
      return [];
  }
};

export const catchError = expressAsyncHandler(
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    const isError = errors.isEmpty();
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!isError) {
      const data = { errors: errors.array() };
      throw createHttpError(400, {
        message: "Validation error!",
        data,
      });
    } else {
      next();
    }
  }
);
