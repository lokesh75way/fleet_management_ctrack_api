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
        check("firstName")
          .notEmpty()
          .bail()
          .withMessage("First name is required"),
        check("lastName")
          .notEmpty()
          .bail()
          .withMessage("Last name is required"),
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

    case "group:add": {
      return [
        check("userName")
          .exists({ values: "falsy" })
          .bail()
          .withMessage("User name is required"),
        check("groupName")
          .exists({ values: "falsy" })
          .notEmpty()
          .bail()
          .withMessage("Business Group name is required"),
        check("email")
          .exists()
          .notEmpty()
          .bail()
          .withMessage("Email is required")
          .isEmail()
          .bail()
          .withMessage("Enter valid email"),
        check("password")
          .exists()
          .notEmpty()
          .isLength({ min: 8 })
          .bail()
          .withMessage("Password must be at least 8 characters long")
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
          )
          .withMessage(
            "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
          ),
        check("helpDeskEmail")
          .exists()
          .notEmpty()
          .bail()
          .withMessage("Email is required")
          .isEmail()
          .bail()
          .withMessage("Enter valid email"),

        check("helpDeskTelephoneNumber").optional().isMobilePhone("any"),

        check("mobileNumber")
          .exists()
          .notEmpty()
          .isMobilePhone("any")
          .withMessage("Enter a valid mobile number"),

        check("whatsappContactNumber").optional().isMobilePhone("any"),

        check("country").exists().notEmpty().withMessage("Country is required"),

        check("state").optional().notEmpty().withMessage("State is required"),

        check("city").exists().notEmpty().withMessage("City is required"),

        check("zipCode").optional().isPostalCode("any"),

        check("storageCapacity").optional().isNumeric(),

        check("logo").optional().isURL(),

        check("file").optional().isURL(),

        check("street1").exists().notEmpty().withMessage("Street1 is required"),

        check("street2").optional(),

        check("contactPerson").optional(),

        check("faxNumber").optional(),

        check("dateFormat").optional().isIn(["MM-DD-YYYY", "DD-MM-YYYY"]),

        check("timeFormat").optional().isIn(["12", "24"]),

        check("unitOfDistance")
          .optional()
          .isIn(["MILES", "KILOMETER", "NAUTIC_MILES"]),

        check("unitOfFuel").optional().isIn(["GALLONS", "LITERS"]),

        check("language")
          .optional()
          .isIn(["ENGLISH", "FRENCH", "ARABIC", "PORTUGUESE"]),
          
        check("status").optional().isIn(["ACTIVE", "INACTIVE"]),
        check("workStartDay")
          .optional()
          .isIn([
            "SUNDAY",
            "MONDAY",
            "TUESDAY",
            "WEDNESDAY",
            "THRUSDAY",
            "FRIDAY",
            "SATURDAY",
          ]),

        check("currency").optional().isString(),

        check("timezone").optional().isString(),
      ];
    }
    case "group:add": {
      return [
        check("userName").optional(),

        check("groupName").optional(),

        check("email").optional().isEmail().withMessage("Enter valid email"),

        check("helpDeskEmail")
          .optional()
          .isEmail()
          .withMessage("Enter valid email"),

        check("helpDeskTelephoneNumber").optional().isMobilePhone("any"),

        check("mobileNumber").optional().isMobilePhone("any"),

        check("whatsappContactNumber").optional().isMobilePhone("any"),

        check("country").optional().optional(),

        check("state").optional().optional(),

        check("city").optional().optional(),

        check("zipCode").optional().isPostalCode("any"),

        check("storageCapacity").optional().isNumeric(),

        check("logo").optional().isURL(),

        check("file").optional().isURL(),

        check("street1").optional(),

        check("street2").optional(),

        check("contactPerson").optional(),

        check("faxNumber").optional(),

        check("dateFormat").optional().isIn(["MM-DD-YYYY", "DD-MM-YYYY"]),

        check("timeFormat").optional().isIn(["12", "24"]),

        check("unitOfDistance")
          .optional()
          .isIn(["MILES", "KILOMETER", "NAUTIC_MILES"]),
        check("unitOfFuel").optional().isIn(["GALLONS", "LITERS"]),

        check("language")
          .optional()
          .isIn(["ENGLISH", "FRENCH", "ARABIC", "PORTUGUESE"]),
        check("status").optional().isIn(["ACTIVE", "INACTIVE"]),
        check("workStartDay")
          .optional()
          .isIn([
            "SUNDAY",
            "MONDAY",
            "TUESDAY",
            "WEDNESDAY",
            "THRUSDAY",
            "FRIDAY",
            "SATURDAY",
          ]),

        check("currency").optional().isString(),

        check("timezone").optional().isString(),
      ];
    }

    case "module:add": {
      return [
        check("moduleId")
          .optional()
          .isString()
          .withMessage("Module ID must be a non-empty string"),
        check("title")
          .exists()
          .isString()
          .notEmpty()
          .withMessage("Title must be a non-empty string"),
        check("basePath")
          .exists()
          .isString()
          .notEmpty()
          .withMessage("Base Path must be a non-empty string"),
      ];
    }

    case "module:permission": {
      return [
        check("name")
          .isString()
          .notEmpty()
          .withMessage("Name must be a non-empty string"),
        check("permission")
          .isArray()
          .withMessage("Permission must be an array"),
        check("permission.*.moduleId")
          .isMongoId()
          .withMessage("Module ID must be a valid MongoDB ObjectId"),
        check("permission.*.add")
          .isBoolean()
          .withMessage("Add must be a boolean value"),
        check("permission.*.view")
          .isBoolean()
          .withMessage("View must be a boolean value"),
        check("permission.*.modify")
          .isBoolean()
          .withMessage("Modify must be a boolean value"),
        check("permission.*.delete")
          .isBoolean()
          .withMessage("Delete must be a boolean value"),
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
