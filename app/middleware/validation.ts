import { type Response, type Request, type NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import { check, param, validationResult } from "express-validator";
import createHttpError from "http-errors";
import { UserRole } from "../schema/User";
import {
  CostType,
  DistanceCounter,
  DocumentType,
  DurationUnit,
  DurationBasedUnit,
  FuelSensor,
  FuelType,
  FuelUnit,
  Permit,
  SpeedDetection,
  VehicleCategory,
} from "../schema/Vehicle";
import { DocumentType as DriverDocumentType } from "../schema/Driver";
import { Gender, LeaveType } from "../schema/Technician";
import { CATEGORY, GEOFENCE_ACCESS } from "../schema/Geofence";
import { GEOFENCE_TYPE } from "../schema/Geofence";
import GeoFenceLocation from "../schema/GeofenceLocation";
import { Category, ExpenseType } from "../schema/Expense";
import { Currency, WorkStartDay } from "../schema/BusinessGroup";
import mongoose from "mongoose";

export const validate = (validationName: string): any[] => {
  switch (validationName) {
    case "change:password": {
      return [
        check("_id").exists().notEmpty().bail().withMessage("Id is required"),
        check("oldPassword")
          .exists()
          .notEmpty()
          .bail()
          .withMessage("Old password is required"),
        check("password")
          .exists()
          .notEmpty()
          .bail()
          .withMessage("Password is required")
          .custom((value, { req }) => {
            if (value === req.body.oldPassword) {
              throw new Error(
                "Old password and new password should be different"
              );
            }
            return true;
          }),
        check("confirmPassword")
          .exists()
          .notEmpty()
          .bail()
          .withMessage("Confirm password is required")
          .custom((value, { req }) => {
            if (value !== req.body.password) {
              throw new Error("Password confirmation does not match password");
            }
            return true;
          }),
      ];
    }
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

    case "subadmin:update": {
      return [
        check("email")
          .notEmpty()
          .bail()
          .withMessage("Email is required")
          .isEmail()
          .bail()
          .withMessage("Enter valid email"),
        check("userName")
          .notEmpty()
          .bail()
          .withMessage("First name is required"),
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
        check("userInfo").isArray().withMessage("userInfo must be an array"),

        check("userInfo.*.email").isEmail().withMessage("Invalid email format"),

        check("userInfo.*.name")
          .isString()
          .withMessage("name must be a string")
          .notEmpty()
          .withMessage("name is required"),

        check("userInfo.*.designation")
          .optional()
          .isString()
          .withMessage("designation must be a string"),

        check("userInfo.*.mobileNumber")
          .exists()
          .notEmpty()
          .isMobilePhone("any")
          .withMessage("Enter a valid mobile number"),

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

        check("country").exists().notEmpty().withMessage("Country is required"),

        check("state").optional().notEmpty().withMessage("State is required"),

        check("city").exists().notEmpty().withMessage("City is required"),

        check("logo").optional().isURL(),

        check("currency")
          .optional()
          .isIn(Object.values(Currency))
          .withMessage("Invalid currency"),

        check("workStartDay")
          .optional()
          .isIn(Object.values(WorkStartDay))
          .withMessage("Invalid Work Start Day"),

        check("dateFormat").optional().isIn(["MM-DD-YYYY", "DD-MM-YYYY"]),

        check("timeFormat").optional().isIn(["12 Hour", "24 Hour"]),

        check("timezone").optional().isString(),
      ];
    }

    case "group:update": {
      return [
        check("userName").optional(),

        check("userInfo")
          .optional()
          .isArray()
          .withMessage("userInfo must be an array"),

        check("userInfo.*.email")
          .optional()
          .isEmail()
          .withMessage("Invalid email format"),
        check("userInfo.*.name")
          .optional()
          .isString()
          .withMessage("name must be a string")
          .notEmpty()
          .withMessage("name is required"),
        check("userInfo.*.designation")
          .optional()
          .isString()
          .withMessage("designation must be a string"),
        check("userInfo.*.mobileNumber")
          .optional()
          .isMobilePhone("any")
          .withMessage("Invalid mobile number format"),

        check("groupName").optional(),

        check("email")
          .exists()
          .notEmpty()
          .bail()
          .withMessage("Email is required")
          .isEmail()
          .bail()
          .withMessage("Enter valid email"),

        check("currency")
          .optional()
          .notEmpty()
          .withMessage("Currency is required")
          .isIn(Object.values(Currency))
          .withMessage("Invalid currency"),

        check("workStartDay")
          .optional()
          .notEmpty()
          .withMessage("Work start day is required")
          .isIn(Object.values(WorkStartDay))
          .withMessage("Invalid work start day"),

        check("country").optional().optional(),

        check("state").optional().optional(),

        check("city").optional().optional(),

        check("logo").optional().isURL(),

        check("dateFormat").optional().isIn(["MM-DD-YYYY", "DD-MM-YYYY"]),

        check("timeFormat").optional().isIn(["12 Hour", "24 Hour"]),

        check("timezone").optional().isString(),
      ];
    }

    case "company:add": {
      return [
        check("userInfo").isArray().withMessage("userInfo must be an array"),

        check("userInfo.*.email").isEmail().withMessage("Invalid email format"),

        check("userInfo.*.name")
          .isString()
          .withMessage("name must be a string")
          .notEmpty()
          .withMessage("name is required"),

        check("userInfo.*.designation")
          .optional()
          .isString()
          .withMessage("designation must be a string"),

        check("userInfo.*.mobileNumber")
          .exists()
          .notEmpty()
          .isMobilePhone("any")
          .withMessage("Enter a valid mobile number"),

        check("businessGroupId").optional(),

        check("userName")
          .exists({ values: "falsy" })
          .bail()
          .withMessage("User name is required"),

        check("companyName")
          .exists({ values: "falsy" })
          .notEmpty()
          .bail()
          .withMessage("Company name is required"),

        check("currency")
          .optional()
          .isIn(Object.values(Currency))
          .withMessage("Invalid currency"),

        check("workStartDay")
          .optional()
          .isIn(Object.values(WorkStartDay))
          .withMessage("Invalid currency"),

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

        check("country").exists().notEmpty().withMessage("Country is required"),

        check("state").optional().notEmpty().withMessage("State is required"),

        check("city").exists().notEmpty().withMessage("City is required"),

        check("logo").optional().isURL(),

        check("dateFormat").optional().isIn(["MM-DD-YYYY", "DD-MM-YYYY"]),

        check("timeFormat").optional().isIn(["12 Hour", "24 Hour"]),

        check("timezone").optional().isString(),
      ];
    }

    case "company:update": {
      return [
        check("userInfo")
          .optional()
          .isArray()
          .withMessage("userInfo must be an array"),

        check("userInfo.*.email")
          .optional()
          .isEmail()
          .withMessage("Invalid email format"),
        check("userInfo.*.name")
          .optional()
          .isString()
          .withMessage("name must be a string")
          .notEmpty()
          .withMessage("name is required"),
        check("userInfo.*.designation")
          .optional()
          .isString()
          .withMessage("designation must be a string"),
        check("userInfo.*.mobileNumber")
          .optional()
          .isMobilePhone("any")
          .withMessage("Invalid mobile number format"),

        check("businessGroupId").optional(),

        check("userName").optional(),

        check("companyName").optional(),

        check("email")
          .exists()
          .notEmpty()
          .bail()
          .withMessage("Email is required")
          .isEmail()
          .bail()
          .withMessage("Enter valid email"),

        check("currency")
          .optional()
          .notEmpty()
          .withMessage("Currency is required")
          .isIn(Object.values(Currency))
          .withMessage("Invalid currency"),

        check("workStartDay")
          .optional()
          .notEmpty()
          .withMessage("Work start day is required")
          .isIn(Object.values(WorkStartDay))
          .withMessage("Invalid work start day"),

        check("country").optional().optional(),

        check("state").optional().optional(),

        check("city").optional().optional(),

        check("logo").optional().isURL(),

        check("dateFormat").optional().isIn(["MM-DD-YYYY", "DD-MM-YYYY"]),

        check("timeFormat").optional().isIn(["12 Hour", "24 Hour"]),

        check("timezone").optional().isString(),
      ];
    }

    case "branch:add": {
      return [
        check("businessGroupId")
          .exists({ values: "falsy" })
          .bail()
          .withMessage("Business group Id is required"),

        check("companyId")
          .exists({ values: "falsy" })
          .bail()
          .withMessage("Company Id is required"),

        check("parentBranchId").optional(),

        check("branchName")
          .exists({ values: "falsy" })
          .notEmpty()
          .bail()
          .withMessage("Branch name is required"),

        check("currency")
          .optional()
          .notEmpty()
          .withMessage("Currency is required")
          .isIn(Object.values(Currency))
          .withMessage("Invalid currency"),

        check("workStartDay")
          .optional()
          .notEmpty()
          .withMessage("work start day is required")
          .isIn(Object.values(WorkStartDay))
          .withMessage("Invalid currency"),

        check("country").exists().notEmpty().withMessage("Country is required"),

        check("state").optional().notEmpty().withMessage("State is required"),

        check("city").exists().notEmpty().withMessage("City is required"),

        check("dateFormat").optional().isIn(["MM-DD-YYYY", "DD-MM-YYYY"]),

        check("timeFormat").optional().isIn(["12 Hour", "24 Hour"]),

        check("currency").optional().isString(),

        check("timezone").optional().isString(),
      ];
    }

    case "branch:update": {
      return [
        // check("branchId")
        //   .exists({ values: "falsy" })
        //   .bail()
        //   .withMessage("Branch ID is required"),

        check("businessGroupId").optional(),

        check("companyId").optional(),

        check("parentBranchId").optional(),

        check("branchName").optional(),

        check("currency")
          .optional()
          .notEmpty()
          .withMessage("Currency is required")
          .isIn(Object.values(Currency))
          .withMessage("Invalid currency"),

        check("workStartDay")
          .optional()
          .notEmpty()
          .withMessage("Work start day is required")
          .isIn(Object.values(WorkStartDay))
          .withMessage("Invalid work start day"),

        check("country").optional().optional(),

        check("state").optional().optional(),

        check("city").optional().optional(),

        check("dateFormat").optional().isIn(["MM-DD-YYYY", "DD-MM-YYYY"]),

        check("timeFormat").optional().isIn(["12 Hour", "24 Hour"]),

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
          .optional()
          .isArray()
          .withMessage("Permission must be an array"),
        check("permission.*.moduleId")
          .optional()
          .isMongoId()
          .withMessage("Module ID must be a valid MongoDB ObjectId"),
        check("permission.*.add")
          .optional()
          .isBoolean()
          .withMessage("Add must be a boolean value"),
        check("permission.*.view")
          .optional()
          .isBoolean()
          .withMessage("View must be a boolean value"),
        check("permission.*.modify")
          .optional()
          .isBoolean()
          .withMessage("Modify must be a boolean value"),
        check("permission.*.delete")
          .optional()
          .isBoolean()
          .withMessage("Delete must be a boolean value"),
      ];
    }
    case "module:update-permission": {
      return [
        check("name")
          .optional()
          .bail()
          .isString()
          .notEmpty()
          .withMessage("Name must be a non-empty string"),
        check("permission")
          .optional()
          .bail()
          .isArray()
          .withMessage("Permission must be an array"),
        check("permission.*.moduleId")
          .optional()
          .bail()
          .isMongoId()
          .withMessage("Module ID must be a valid MongoDB ObjectId"),
        check("permission.*.add")
          .optional()
          .bail()
          .isBoolean()
          .withMessage("Add must be a boolean value"),
        check("permission.*.view")
          .optional()
          .bail()
          .isBoolean()
          .withMessage("View must be a boolean value"),
        check("permission.*.modify")
          .optional()
          .bail()
          .isBoolean()
          .withMessage("Modify must be a boolean value"),
        check("permission.*.delete")
          .optional()
          .bail()
          .isBoolean()
          .withMessage("Delete must be a boolean value"),
      ];
    }
    case "vehicle:add": {
      return [
        check("businessGroupId")
          .notEmpty()
          .withMessage("Business group ID is required")
          .isMongoId()
          .withMessage("Business group ID must be a valid MongoDB ObjectId"),
        check("companyId")
          .notEmpty()
          .withMessage("Company ID is required")
          .isMongoId()
          .withMessage("Company ID must be a valid MongoDB ObjectId"),
        check("branchId").optional({ checkFalsy: false }),

        check("vehicleName").notEmpty().withMessage("Vehicle name is required"),
        check("deviceType")
          .notEmpty()
          .isString()
          .withMessage("Device type is required"),
        check("imeiNumber")
          .notEmpty()
          .withMessage("IMEI number is required")
          .isString()
          .withMessage("IMEI number must be a string"),
        check("copyFrom").optional(),
        check("serverAddress")
          .optional()
          .isURL()
          .withMessage("Server address must be a valid URL"),
        check("simNumber")
          .notEmpty()
          .isString()
          .withMessage("SIM number must be a string"),
        check("secondrySimNumber")
          .optional()
          .isString()
          .withMessage("Secondary SIM number must be a string"),
        check("distanceCounter")
          .notEmpty()
          .withMessage("Distance counter is required")
          .isIn(Object.values(DistanceCounter))
          .withMessage("Invalid distance counter value"),
        check("speedDetection")
          .optional()
          .isIn(Object.values(SpeedDetection))
          .withMessage("Invalid speed detection value"),
        check("deviceAccuracyTolerance")
          .notEmpty()
          .isString()
          .withMessage("Device accuracy tolerance must be a string"),
        // check("plateNumber").notEmpty().withMessage("Plate number is required"),
        check("vehicleCategory")
          .notEmpty()
          .withMessage("Vehicle category is required")
          .isIn(Object.values(VehicleCategory))
          .withMessage("Invalid vehicle category value"),
        check("dvirTemplate").optional(),
        check("manufacturerDate")
          .optional()
          .isISO8601()
          .withMessage("Manufacturer date must be a valid ISO 8601 date"),
        check("purchaseDate")
          .optional()
          .isISO8601()
          .withMessage("Purchase date must be a valid ISO 8601 date"),
        check("purchaseAmount")
          .notEmpty()
          .isNumeric()
          .withMessage("Purchase amount must be a number"),
        // check("weightCapacity")
        //   .notEmpty()
        //   .isNumeric()
        //   .withMessage("Weight capacity must be a number"),
        check("gpsInstallationDate")
          .optional()
          .isISO8601()
          .withMessage("GPS installation date must be a valid ISO 8601 date"),
        // check("gpsWarranty")
        //   .notEmpty()
        //   .isNumeric()
        //   .withMessage("GPS warranty must be a number"),
        check("companyAverage")
          .optional()
          .isString()
          .withMessage("Company average must be a string"),
        check("permit")
          .notEmpty()
          .isIn(Object.values(Permit))
          .withMessage("Invalid permit value"),
        check("installationDate")
          .optional()
          .isISO8601()
          .withMessage("Installation date must be a valid ISO 8601 date"),
        check("registrationNumber")
          .optional()
          .isString()
          .withMessage("Registration number must be a string"),
        check("fuelType")
          .notEmpty()
          .isIn(Object.values(FuelType))
          .withMessage("Invalid fuel type value"),
        // check("distanceBaseFuelConsumption")
        //   .optional()
        //   .isNumeric()
        //   .withMessage("Distance base fuel consumption must be a number"),
        // check("durationBaseFuelConsumption")
        //   .optional()
        //   .isNumeric()
        //   .withMessage("Duration base fuel consumption must be a number"),
        check("fuelIdlingConsumption").optional(),
        check("consumptionTolerancePercent")
          .optional()
          .isNumeric()
          .withMessage("Consumption tolerance percent must be a number"),
        check("vinNumber")
          .optional()
          .isNumeric()
          .withMessage("VIN number must be a number"),
        check("engineNumber")
          .optional()
          .isString()
          .withMessage("Engine number must be a string"),
        check("odometer").optional(),
        check("lsbDetectionRadius").optional(),
        check("engineHour").optional(),
        check("passengerSeat")
          .optional()
          .isNumeric()
          .withMessage("Passenger seat must be a number"),
        check("costType")
          .optional()
          .isIn(Object.values(CostType))
          .withMessage("Invalid cost type value"),
        check("distanceCostQuantity")
          .optional()
          .isNumeric()
          .withMessage("Distance must be a number"),
        check("durationCostQuantity")
          .optional()
          .isNumeric()
          .withMessage("Duration must be a number"),
        check("rfidTimeoutDuration")
          .optional()
          .isNumeric()
          .withMessage("RFID timeout duration must be a number"),
        check("sleepModeDuration")
          .optional()
          .isNumeric()
          .withMessage("Sleep mode duration must be a number"),
        check("minimumWorkingHour")
          .optional()
          .isNumeric()
          .withMessage("Minimum working hour must be a number"),
        check("weightSensor")
          .optional()
          .isBoolean()
          .withMessage("Weight sensor must be a boolean"),
        check("underweightTolerance")
          .optional()
          .isNumeric()
          .withMessage("Underweight tolerance must be a number"),
        check("overweightTolerance")
          .optional()
          .isNumeric()
          .withMessage("Overweight tolerance must be a number"),
        check("loadingUnloadingTolerance")
          .optional()
          .isNumeric()
          .withMessage("Loading/unloading tolerance must be a number"),
        check("fuelSensor")
          .optional()
          .isIn(Object.values(FuelSensor))
          .withMessage("Invalid fuel sensor value"),
        check("gSensor")
          .optional()
          .isBoolean()
          .withMessage("G-sensor must be a boolean"),
        check("documents.*.documentType")
          .notEmpty()
          .withMessage("Document type is required")
          .isIn(Object.values(DocumentType))
          .withMessage("Invalid document type value"),
        check("documents.*.file")
          .notEmpty()
          .withMessage("Document file is required"),
        check("documents.*.issueDate")
          .notEmpty()
          .withMessage("Issue date is required"),

        check("noOfTanks")
          .optional()
          .isNumeric()
          .withMessage("Number of tanks must be a number"),
        check("LBSDetectionRadius")
          .optional()
          .isNumeric()
          .withMessage("LBS Detection Radius must be a number"),
        check("durationUnit")
          .optional()
          .isIn(Object.values(DurationUnit))
          .withMessage("Invalid duration unit"),
        check("axisX")
          .optional()
          .isNumeric()
          .withMessage("Axis X must be a number"),
        check("axisY")
          .optional()
          .isNumeric()
          .withMessage("Axis Y must be a number"),
        check("axisZ")
          .optional()
          .isNumeric()
          .withMessage("Axis Z must be a number"),
        check("fuelIdlingConsumptionUnit")
          .optional()
          .isIn(Object.values(FuelUnit))
          .withMessage("Invalid fuel idling consumption unit"),
        check("distanceBasedDistanceQuantity")
          .optional()
          .isNumeric()
          .withMessage("Distance based distance quantity must be a number"),
        check("distanceBaseFuelConsumption")
          .optional()
          .isNumeric()
          .withMessage("Distance base fuel consumption must be a number"),
        check("distanceBaseFuelConsumptionUnit")
          .optional()
          .isIn(Object.values(FuelUnit))
          .withMessage("Invalid distance base fuel consumption unit"),
        check("durationBaseFuelConsumptionDurationQuanitty")
          .optional()
          .isNumeric()
          .withMessage(
            "Duration base fuel consumption duration quantity must be a number"
          ),
        check("durationBaseFuelConsumptionDurationUnit")
          .optional()
          .isIn(Object.values(DurationBasedUnit))
          .withMessage("Invalid duration base fuel consumption duration unit"),
        check("durationBaseDistanceQuantity")
          .optional()
          .isNumeric()
          .withMessage("Duration base distance quantity must be a number"),
        check("durationBaseFuelConsumptionUnit")
          .optional()
          .isIn(Object.values(FuelUnit))
          .withMessage("Invalid duration base fuel consumption unit"),
        check("vehicleNumber")
          .optional()
          .isString()
          .withMessage("Invalid Vehicle Number"),
        check("unitId")
          .optional()
          .isString()
          .withMessage("Invalid Unit Id"),
        check("fleetNumber")
          .optional()
          .isString()
          .withMessage("Invalid Fleet Number"),
        check("description")
          .optional()
          .isString()
          .withMessage("Invalid description"),
        check("manufacture")
          .optional()
          .isString()
          .withMessage("Invalid Manufacture"),
        check("year")
          .optional()
          .isNumeric()
          .withMessage("Invalid Year"),
        check("model")
          .optional()
          .isString()
          .withMessage("Invalid Model"),
        check("color")
          .optional()
          .isString()
          .withMessage("Invalid color"),
        check("vinChassisNumber")
          .optional()
          .isNumeric()
          .withMessage("Invalid vin Chasis Number"),
        check("group")
          .optional()
          .isString()
          .withMessage("Invalid Group"),
        check("groupDescription")
          .optional()
          .isString()
          .withMessage("Invalid Group Description"),
        check("tollCategory")
          .optional()
          .isString()
          .withMessage("Invalid Toll Category"),
        check("tarrifType")
          .optional()
          .isString()
          .withMessage("Invalid Tarrif Type"),
        check("licenseNumber")
          .optional()
          .isString()
          .withMessage("Invalid License Number"),
        check("licenseExpire")
          .optional()
          .isString()
          .withMessage("Invalid License Expire"),
        check("roadWorthy")
          .optional()
          .isString()
          .withMessage("Invalid Road Worthy"),
        check("roadWorthyExpire")
          .optional()
          .isString()
          .withMessage("Invalid Road Worthy Expire"),
        check("odo")
          .optional()
          .isString()
          .withMessage("Invalid Odo"),
        check("odoNextService")
          .optional()
          .isString()
          .withMessage("Invalid Odo Next Service"),
        check("hours")
          .optional()
          .isString()
          .withMessage("Invalid Hours"),
        check("hoursNextService")
          .optional()
          .isString()
          .withMessage("Invalid Hours Next Service"),
        check("currentStatus")
          .optional()
          .isString()
          .withMessage("Invalid current Status"),
        check("speed")
          .optional()
          .isString()
          .withMessage("Invalid Speed"),
        check("currentDriver")
          .optional()
          .isString()
          .withMessage("Invalid current Driver"),
        check("heading")
          .optional()
          .isString()
          .withMessage("Invalid Heading"),
        check("currentLocation")
          .optional()
          .isString()
          .withMessage("Invalid Current Location"),
        check("skillSet")
          .optional()
          .isString()
          .withMessage("Invalid Skill Set"),
        check("profile")
          .optional()
          .isString()
          .withMessage("Invalid profile"),
        check("owningCostCenter")
          .optional()
          .isString()
          .withMessage("Invalid Owning Cost Center"),
        check("licenseReminder*lastRenewalDate")
          .optional({ values: "falsy" }),
        check("licenseReminder*period")
          .optional({ values: "falsy" }),
        check("licenseReminder*nextRenewalDate")
          .optional({ values: "falsy" }),
        check("licenseReminder*reminderStarts")
          .optional({ values: "falsy" }),
        check("roadWorthyReminder*lastRenewalDate")
          .optional({ values: "falsy" }),
        check("roadWorthyReminder*period")
          .optional({ values: "falsy" }),
        check("roadWorthyReminder*nextRenewalDate")
          .optional({ values: "falsy" }),
        check("roadWorthyReminder*reminderStarts")
          .optional({ values: "falsy" }),
      ];
    }

    case "vehicle:update": {
      return [
        check("businessGroupId")
          .optional({ values: "falsy" })
          .isMongoId()
          .withMessage("Business group ID must be a valid MongoDB ObjectId"),
        check("companyId")
          .optional({ values: "falsy" })
          .isMongoId()
          .withMessage("Company ID must be a valid MongoDB ObjectId"),
        check("branchId")
          .optional({ values: "falsy" })
          .bail()
          .isMongoId()
          .withMessage("Branch ID must be a valid MongoDB ObjectId"),
        check("vehicleName").optional({ values: "falsy" }),
        check("deviceType").optional(),
        check("imeiNumber")
          .optional({ values: "falsy" })
          .isString()
          .withMessage("IMEI number must be a string"),
        check("copyFrom").optional(),
        check("serverAddress")
          .optional()
          .isURL()
          .withMessage("Server address must be a valid URL"),
        check("simNumber")
          .optional()
          .isString()
          .withMessage("SIM number must be a string"),
        check("secondrySimNumber")
          .optional()
          .isString()
          .withMessage("Secondary SIM number must be a string"),
        check("distanceCounter")
          .optional({ values: "falsy" })
          .isIn(Object.values(DistanceCounter))
          .withMessage("Invalid distance counter value"),
        check("speedDetection")
          .optional()
          .isIn(Object.values(SpeedDetection))
          .withMessage("Invalid speed detection value"),
        check("deviceAccuracyTolerance")
          .optional()
          .isString()
          .withMessage("Device accuracy tolerance must be a string"),
        // check("plateNumber").optional({ values: "falsy" }),
        check("vehicleCategory")
          .optional({ values: "falsy" })
          .isIn(Object.values(VehicleCategory))
          .withMessage("Invalid vehicle category value"),
        check("dvirTemplate").optional(),
        check("manufacturerDate")
          .optional()
          .isISO8601()
          .withMessage("Manufacturer date must be a valid ISO 8601 date"),
        check("purchaseDate")
          .optional()
          .isISO8601()
          .withMessage("Purchase date must be a valid ISO 8601 date"),
        check("purchaseAmount")
          .optional()
          .isNumeric()
          .withMessage("Purchase amount must be a number"),
        // check("weightCapacity")
        //   .optional()
        //   .isNumeric()
        //   .withMessage("Weight capacity must be a number"),
        check("gpsInstallationDate")
          .optional()
          .isISO8601()
          .withMessage("GPS installation date must be a valid ISO 8601 date"),
        // check("gpsWarranty")
        //   .optional()
        //   .isNumeric()
        //   .withMessage("GPS warranty must be a number"),
        check("companyAverage")
          .optional()
          .isString()
          .withMessage("Company average must be a string"),
        check("permit")
          .optional()
          .isIn(Object.values(Permit))
          .withMessage("Invalid permit value"),
        check("installationDate")
          .optional()
          .isISO8601()
          .withMessage("Installation date must be a valid ISO 8601 date"),
        check("registrationNumber")
          .optional()
          .isString()
          .withMessage("Registration number must be a string"),
        check("fuelType")
          .optional()
          .isIn(Object.values(FuelType))
          .withMessage("Invalid fuel type value"),
        // check("distanceBaseFuelConsumption")
        //   .optional()
        //   .isNumeric()
        //   .withMessage("Distance base fuel consumption must be a number"),
        // check("durationBaseFuelConsumption")
        //   .optional()
        //   .isNumeric()
        //   .withMessage("Duration base fuel consumption must be a number"),
        check("fuelIdlingConsumption").optional(),
        check("consumptionTolerancePercent")
          .optional()
          .isNumeric()
          .withMessage("Consumption tolerance percent must be a number"),
        check("vinNumber")
          .optional()
          .isNumeric()
          .withMessage("VIN number must be a number"),
        check("engineNumber")
          .optional()
          .isString()
          .withMessage("Engine number must be a string"),
        check("odometer").optional(),
        check("lsbDetectionRadius").optional(),
        check("engineHour").optional(),
        check("passengerSeat")
          .optional()
          .isNumeric()
          .withMessage("Passenger seat must be a number"),
        check("costType")
          .optional()
          .isIn(Object.values(CostType))
          .withMessage("Invalid cost type value"),
        check("distanceCostQuantity")
          .optional()
          .isNumeric()
          .withMessage("Distance must be a number"),
        check("durationCostQuantity")
          .optional()
          .isNumeric()
          .withMessage("Duration must be a number"),
        check("rfidTimeoutDuration")
          .optional()
          .isNumeric()
          .withMessage("RFID timeout duration must be a number"),
        check("sleepModeDuration")
          .optional()
          .isNumeric()
          .withMessage("Sleep mode duration must be a number"),
        check("minimumWorkingHour")
          .optional()
          .isNumeric()
          .withMessage("Minimum working hour must be a number"),
        check("weightSensor")
          .optional()
          .isBoolean()
          .withMessage("Weight sensor must be a boolean"),
        check("underweightTolerance")
          .optional()
          .isNumeric()
          .withMessage("Underweight tolerance must be a number"),
        check("overweightTolerance")
          .optional()
          .isNumeric()
          .withMessage("Overweight tolerance must be a number"),
        check("loadingUnloadingTolerance")
          .optional()
          .isNumeric()
          .withMessage("Loading/unloading tolerance must be a number"),
        check("fuelSensor")
          .optional()
          .isIn(Object.values(FuelSensor))
          .withMessage("Invalid fuel sensor value"),
        check("gSensor")
          .optional()
          .isBoolean()
          .withMessage("G-sensor must be a boolean"),
        check("documents.*.documentType")
          .optional({ values: "falsy" })
          .isIn(Object.values(DocumentType))
          .withMessage("Invalid document type value"),
        check("documents.*.file").optional({ values: "falsy" }),
        check("documents.*.issueDate").optional({ values: "falsy" }),

        check("noOfTanks")
          .optional()
          .isNumeric()
          .withMessage("Number of tanks must be a number"),
        check("LBSDetectionRadius")
          .optional()
          .isNumeric()
          .withMessage("LBS Detection Radius must be a number"),
        check("durationUnit")
          .optional()
          .isIn(Object.values(DurationUnit))
          .withMessage("Invalid duration unit"),
        check("axisX")
          .optional()
          .isNumeric()
          .withMessage("Axis X must be a number"),
        check("axisY")
          .optional()
          .isNumeric()
          .withMessage("Axis Y must be a number"),
        check("axisZ")
          .optional()
          .isNumeric()
          .withMessage("Axis Z must be a number"),
        check("fuelIdlingConsumptionUnit")
          .optional()
          .isIn(Object.values(FuelUnit))
          .withMessage("Invalid fuel idling consumption unit"),
        check("distanceBasedDistanceQuantity")
          .optional()
          .isNumeric()
          .withMessage("Distance based distance quantity must be a number"),
        check("distanceBaseFuelConsumption")
          .optional()
          .isNumeric()
          .withMessage("Distance base fuel consumption must be a number"),
        check("distanceBaseFuelConsumptionUnit")
          .optional()
          .isIn(Object.values(FuelUnit))
          .withMessage("Invalid distance base fuel consumption unit"),
        check("durationBaseFuelConsumptionDurationQuanitty")
          .optional()
          .isNumeric()
          .withMessage(
            "Duration base fuel consumption duration quantity must be a number"
          ),
        check("durationBaseFuelConsumptionDurationUnit")
          .optional()
          .isIn(Object.values(DurationBasedUnit))
          .withMessage("Invalid duration base fuel consumption duration unit"),
        check("durationBaseDistanceQuantity")
          .optional()
          .isNumeric()
          .withMessage("Duration base distance quantity must be a number"),
        check("durationBaseFuelConsumptionUnit")
          .optional()
          .isIn(Object.values(FuelUnit))
          .withMessage("Invalid duration base fuel consumption unit"),
        check("vehicleNumber")
          .optional()
          .isString()
          .withMessage("Invalid Vehicle Number"),
        check("unitId")
          .optional()
          .isString()
          .withMessage("Invalid Unit Id"),
        check("fleetNumber")
          .optional()
          .isString()
          .withMessage("Invalid Fleet Number"),
        check("description")
          .optional()
          .isString()
          .withMessage("Invalid description"),
        check("manufacture")
          .optional()
          .isString()
          .withMessage("Invalid Manufacture"),
        check("year")
          .optional()
          .isNumeric()
          .withMessage("Invalid Year"),
        check("model")
          .optional()
          .isString()
          .withMessage("Invalid Model"),
        check("color")
          .optional()
          .isString()
          .withMessage("Invalid color"),
        check("vinChassisNumber")
          .optional()
          .isNumeric()
          .withMessage("Invalid vin Chasis Number"),
        check("group")
          .optional()
          .isString()
          .withMessage("Invalid Group"),
        check("groupDescription")
          .optional()
          .isString()
          .withMessage("Invalid Group Description"),
        check("tollCategory")
          .optional()
          .isString()
          .withMessage("Invalid Toll Category"),
        check("tarrifType")
          .optional()
          .isString()
          .withMessage("Invalid Tarrif Type"),
        check("licenseNumber")
          .optional()
          .isString()
          .withMessage("Invalid License Number"),
        check("licenseExpire")
          .optional()
          .isString()
          .withMessage("Invalid License Expire"),
        check("roadWorthy")
          .optional()
          .isString()
          .withMessage("Invalid Road Worthy"),
        check("roadWorthyExpire")
          .optional()
          .isString()
          .withMessage("Invalid Road Worthy Expire"),
        check("odo")
          .optional()
          .isString()
          .withMessage("Invalid Odo"),
        check("odoNextService")
          .optional()
          .isString()
          .withMessage("Invalid Odo Next Service"),
        check("hours")
          .optional()
          .isString()
          .withMessage("Invalid Hours"),
        check("hoursNextService")
          .optional()
          .isString()
          .withMessage("Invalid Hours Next Service"),
        check("currentStatus")
          .optional()
          .isString()
          .withMessage("Invalid current Status"),
        check("speed")
          .optional()
          .isString()
          .withMessage("Invalid Speed"),
        check("currentDriver")
          .optional()
          .isString()
          .withMessage("Invalid current Driver"),
        check("heading")
          .optional()
          .isString()
          .withMessage("Invalid Heading"),
        check("currentLocation")
          .optional()
          .isString()
          .withMessage("Invalid Current Location"),
        check("skillSet")
          .optional()
          .isString()
          .withMessage("Invalid Skill Set"),
        check("profile")
          .optional()
          .isString()
          .withMessage("Invalid profile"),
        check("owningCostCenter")
          .optional()
          .isString()
          .withMessage("Invalid Owning Cost Center"),
        check("licenseReminder*lastRenewalDate")
          .optional({ values: "falsy" }),
        check("licenseReminder*period")
          .optional({ values: "falsy" }),
        check("licenseReminder*nextRenewalDate")
          .optional({ values: "falsy" }),
        check("licenseReminder*reminderStarts")
          .optional({ values: "falsy" }),
        check("roadWorthyReminder*lastRenewalDate")
          .optional({ values: "falsy" }),
        check("roadWorthyReminder*period")
          .optional({ values: "falsy" }),
        check("roadWorthyReminder*nextRenewalDate")
          .optional({ values: "falsy" }),
        check("roadWorthyReminder*reminderStarts")
          .optional({ values: "falsy" }),
          check("vehicleNumber")
          .optional()
          .isString()
          .withMessage("Invalid Vehicle Number"),
        check("unitId")
          .optional()
          .isString()
          .withMessage("Invalid Unit Id"),
        check("fleetNumber")
          .optional()
          .isString()
          .withMessage("Invalid Fleet Number"),
        check("description")
          .optional()
          .isString()
          .withMessage("Invalid description"),
        check("manufacture")
          .optional()
          .isString()
          .withMessage("Invalid Manufacture"),
        check("year")
          .optional()
          .isNumeric()
          .withMessage("Invalid Year"),
        check("model")
          .optional()
          .isString()
          .withMessage("Invalid Model"),
        check("color")
          .optional()
          .isString()
          .withMessage("Invalid color"),
        check("vinChassisNumber")
          .optional()
          .isNumeric()
          .withMessage("Invalid vin Chasis Number"),
        check("group")
          .optional()
          .isString()
          .withMessage("Invalid Group"),
        check("groupDescription")
          .optional()
          .isString()
          .withMessage("Invalid Group Description"),
        check("tollCategory")
          .optional()
          .isString()
          .withMessage("Invalid Toll Category"),
        check("tarrifType")
          .optional()
          .isString()
          .withMessage("Invalid Tarrif Type"),
        check("licenseNumber")
          .optional()
          .isString()
          .withMessage("Invalid License Number"),
        check("licenseExpire")
          .optional()
          .isString()
          .withMessage("Invalid License Expire"),
        check("roadWorthy")
          .optional()
          .isString()
          .withMessage("Invalid Road Worthy"),
        check("roadWorthyExpire")
          .optional()
          .isString()
          .withMessage("Invalid Road Worthy Expire"),
        check("odo")
          .optional()
          .isString()
          .withMessage("Invalid Odo"),
        check("odoNextService")
          .optional()
          .isString()
          .withMessage("Invalid Odo Next Service"),
        check("hours")
          .optional()
          .isString()
          .withMessage("Invalid Hours"),
        check("hoursNextService")
          .optional()
          .isString()
          .withMessage("Invalid Hours Next Service"),
        check("currentStatus")
          .optional()
          .isString()
          .withMessage("Invalid current Status"),
        check("speed")
          .optional()
          .isString()
          .withMessage("Invalid Speed"),
        check("currentDriver")
          .optional()
          .isString()
          .withMessage("Invalid current Driver"),
        check("heading")
          .optional()
          .isString()
          .withMessage("Invalid Heading"),
        check("currentLocation")
          .optional()
          .isString()
          .withMessage("Invalid Current Location"),
        check("skillSet")
          .optional()
          .isString()
          .withMessage("Invalid Skill Set"),
        check("profile")
          .optional()
          .isString()
          .withMessage("Invalid profile"),
        check("owningCostCenter")
          .optional()
          .isString()
          .withMessage("Invalid Owning Cost Center"),
        check("licenseReminder*lastRenewalDate")
          .optional({ values: "falsy" }),
        check("licenseReminder*period")
          .optional({ values: "falsy" }),
        check("licenseReminder*nextRenewalDate")
          .optional({ values: "falsy" }),
        check("licenseReminder*reminderStarts")
          .optional({ values: "falsy" }),
        check("roadWorthyReminder*lastRenewalDate")
          .optional({ values: "falsy" }),
        check("roadWorthyReminder*period")
          .optional({ values: "falsy" }),
        check("roadWorthyReminder*nextRenewalDate")
          .optional({ values: "falsy" }),
        check("roadWorthyReminder*reminderStarts")
          .optional({ values: "falsy" }),
      ];
    }

    case "id:mongoId": {
      return [
        param("id")
          .exists()
          .notEmpty()
          .isMongoId()
          .bail()
          .withMessage("Provide valid id"),
      ];
    }

    case "driver:delete": {
      return [
        check("driverIds")
          .exists()
          .notEmpty()
          .isArray({ min: 1 })
          .bail()
          .withMessage("Provide driver ids"),
        check("driverIds.*")
          .exists()
          .notEmpty()
          .trim()
          .isMongoId()
          .bail()
          .withMessage("Enter valid driver id"),
      ];
    }

    case "driver:add": {
      return [
        check("businessGroupId")
          .exists()
          .notEmpty()
          .isMongoId()
          .bail()
          .withMessage("Provide valid group"),
        check("companyId")
          .exists()
          .notEmpty()
          .isMongoId()
          .bail()
          .withMessage("Provide valid company"),
        check("branchId")
          .exists()
          .notEmpty()
          .isMongoId()
          .bail()
          .withMessage("Provide valid branch"),
        check("firstName")
          .exists()
          .notEmpty()
          .bail()
          .withMessage("First name is required"),
        check("lastName")
          .exists()
          .notEmpty()
          .bail()
          .withMessage("Last name is required"),
        check("employeeNumber")
          .exists()
          .notEmpty()
          .isString()
          .bail()
          .withMessage("Enter vaild employee number"),
        check("country")
          .exists()
          .notEmpty()
          .isString()
          .bail()
          .withMessage("Country is required"),
        check("state")
          .optional({ values: "falsy" })
          .isString()
          .bail()
          .withMessage("Enter vaild state name"),
        check("city")
          .exists()
          .notEmpty()
          .isString()
          .bail()
          .withMessage("City is required"),
        check("zipCode")
          .optional()
          .custom((value, { req }) => {
            if (value) {
              check("zipCode")
                .isPostalCode("any")
                .withMessage("Invalid postal code");
            }
            return true;
          }),

        check("street1").exists().notEmpty().withMessage("Street1 is required"),
        check("street2").optional(),
        check("contact1")
          .exists()
          .notEmpty()
          .isMobilePhone("any")
          .bail()
          .withMessage("Contact number is required"),
        check("contact2")
          .optional({ values: "falsy" })
          .isMobilePhone("any")
          .bail()
          .withMessage("Enter vaild contact"),
        check("dateOfBirth")
          .exists()
          .optional()
          .isISO8601()
          .withMessage("Enter vaild date of birth"),
        check("age")
          .exists()
          .notEmpty()
          .isInt({ min: 1 })
          .bail()
          .withMessage("Age is required"),
        check("dateOfJoining")
          .optional({ values: "falsy" })
          .isISO8601()
          .withMessage("Enter vaild date of joining"),
        check("dateOfLeaving")
          .optional({ values: "falsy" })
          .isISO8601()
          .withMessage("Enter vaild date of leaving"),
        check("drivingExperience")
          .exists()
          .notEmpty()
          .isFloat({ min: 0 })
          .bail()
          .withMessage("Driving experience is required"),
        check("licenseAvailable").exists().isBoolean(),
        check("licenseNumber").optional({ values: "falsy" }).isString(),
        check("licenseToDriver").optional({ values: "falsy" }).isString(),
        check("licenseIssueDate")
          .exists()
          .optional()
          .isISO8601()
          .withMessage("Enter valid issue date"),
        check("licenseExpiryDate")
          .exists()
          .optional()
          .isISO8601()
          .withMessage("Enter vaild expiry date"),
        check("lifeInsuranceNumber").optional({ values: "falsy" }).isString(),
        check("lifeInsuranceExpiry")
          .optional({ values: "falsy" })
          .isISO8601()
          .withMessage("Enter vaild insurance expiry date"),
        check("mediclaimExpiry")
          .optional({ values: "falsy" })
          .isISO8601()
          .withMessage("Enter vaild mediclaim expiry date"),
        check("mediclaimNumber").optional({ values: "falsy" }).isString(),
        check("active").optional().isBoolean(),
        check("documents")
          .exists()
          .notEmpty()
          .isArray({ min: 1 })
          .bail()
          .withMessage("Atleast one document is required"),
        check("documents.*.documentType")
          .notEmpty()
          .withMessage("Document type is required")
          .isIn(Object.values(DriverDocumentType))
          .withMessage("Invalid document type value"),
        check("documents.*.file")
          .exists()
          .notEmpty()
          .isURL()
          .bail()
          .withMessage("Provide valid document"),
        check("documents.*.issueDate")
          .notEmpty()
          .withMessage("Issue date is required"),
        check("documents.*.expireDate")
          .notEmpty()
          .withMessage("Expire date is required"),
      ];
    }

    case "driver:update": {
      return [
        check("businessGroupId")
          .optional()
          .isMongoId()
          .bail()
          .withMessage("Provide valid group"),
        check("companyId")
          .optional()
          .isMongoId()
          .bail()
          .withMessage("Provide valid company"),
        check("branchId")
          .optional()
          .isMongoId()
          .bail()
          .withMessage("Provide valid branch"),
        check("firstName")
          .exists()
          .notEmpty()
          .bail()
          .withMessage("First name is required"),
        check("lastName")
          .exists()
          .notEmpty()
          .bail()
          .withMessage("Last name is required"),
        check("employeeNumber")
          .optional()
          .isString()
          .bail()
          .withMessage("Enter vaild employee number"),
        check("country").optional().isString(),
        check("state")
          .optional()
          .isString()
          .bail()
          .withMessage("Enter vaild state name"),
        check("city")
          .optional()
          .isString()
          .bail()
          .withMessage("Enter valid city name"),
        check("zipCode")
          .optional()
          .custom((value, { req }) => {
            if (value) {
              check("zipCode")
                .isPostalCode("any")
                .withMessage("Invalid postal code");
            }
            return true;
          }),

        check("street1").optional(),
        check("street2").optional(),
        check("contact1")
          .optional()
          .isMobilePhone("any")
          .bail()
          .withMessage("Enter valid contact number"),
        check("contact2")
          .optional()
          .isMobilePhone("any")
          .bail()
          .withMessage("Enter vaild contact"),
        check("dateOfBirth")
          .optional()
          .isISO8601()
          .withMessage("Enter vaild date of birth"),
        check("age")
          .optional()
          .isInt({ min: 1 })
          .bail()
          .withMessage("Enter valid age"),
        check("dateOfJoining")
          .optional()
          .isISO8601()
          .withMessage("Enter vaild date of joining"),
        check("dateOfLeaving")
          .optional()
          .isISO8601()
          .withMessage("Enter vaild date of leaving"),
        check("drivingExperience").optional().isFloat({ min: 0 }),
        check("licenseAvailable").optional().isBoolean(),
        check("licenseNumber").optional().isString(),
        check("licenseToDriver").optional().isString(),
        check("licenseIssueDate")
          .optional()
          .isISO8601()
          .withMessage("Enter valid issue date"),
        check("licenseExpiryDate")
          .optional()
          .isISO8601()
          .withMessage("Enter vaild expiry date"),
        check("lifeInsuranceNumber").optional().isString(),
        check("lifeInsuranceExpiry")
          .optional()
          .isISO8601()
          .withMessage("Enter vaild insurance expiry date"),
        check("mediclaimExpiry")
          .optional()
          .isISO8601()
          .withMessage("Enter vaild medicalaim expiry date"),
        check("mediclaimNumber").optional().isString(),
        check("active").optional().isBoolean(),
        check("documents")
          .optional()
          .isArray({ min: 1 })
          .bail()
          .withMessage("Atlease one document is required"),
        check("documents.*.documentType")
          .optional({ values: "falsy" })
          .isIn(Object.values(DriverDocumentType))
          .withMessage("Document type is required"),
        check("documents.*.file").optional({ values: "falsy" }),
        check("documents.*.issueDate").optional({ values: "falsy" }),
        check("documents.*.expireDate").optional({ values: "falsy" }),
      ];
    }

    case "task:create": {
      return [
        check("technician")
          .exists()
          .notEmpty()
          .trim()
          .isMongoId()
          .bail()
          .withMessage("Enter valid technician id"),
        check("taskCategory")
          .exists()
          .notEmpty()
          .bail()
          .withMessage("Task category is required!"),
        check("taskName")
          .exists()
          .notEmpty()
          .isString()
          .bail()
          .withMessage("Task name is required!"),
        check("taskPriority")
          .exists()
          .notEmpty()
          .bail()
          .withMessage("Task priority is required!"),
        check("serviceLocation")
          .exists()
          .notEmpty()
          .bail()
          .withMessage("Service location is required!"),
        check("plannedReportingDate")
          .exists()
          .notEmpty()
          .isDate()
          .bail()
          .withMessage("Planned reporting date is required!"),
        check("reportingTime")
          .exists()
          .notEmpty()
          .bail()
          .withMessage("Reporting time is required!"),
      ];
    }

    case "task:update": {
      return [
        check("technician")
          .exists()
          .notEmpty()
          .trim()
          .isMongoId()
          .bail()
          .withMessage("Enter valid technician id"),
        check("taskCategory")
          .exists()
          .notEmpty()
          .bail()
          .withMessage("Task category is required!"),
        check("taskName")
          .exists()
          .notEmpty()
          .isString()
          .bail()
          .withMessage("Task name is required!"),
        check("taskPriority")
          .exists()
          .notEmpty()
          .bail()
          .withMessage("Task priority is required!"),
        check("serviceLocation")
          .exists()
          .notEmpty()
          .bail()
          .withMessage("Service location is required!"),
        check("plannedReportingDate")
          .exists()
          .notEmpty()
          .isDate()
          .bail()
          .withMessage("Planned reporting date is required!"),
        check("reportingTime")
          .exists()
          .notEmpty()
          .bail()
          .withMessage("Reporting time is required!"),
      ];
    }

    case "technician:create": {
      return [
        check("company")
          .notEmpty()
          .withMessage("Company is required")
          .bail()
          .isMongoId()
          .withMessage("Id must be mongoDB ID"),
        check("firstName").notEmpty().withMessage("First name is required"),
        check("lastName").notEmpty().withMessage("Last name is required"),
        check("technicianNo")
          .notEmpty()
          .withMessage("Technician number is required"),
        check("email")
          .notEmpty()
          .withMessage("Email is required")
          .isEmail()
          .withMessage("Invalid email address"),
        check("mobileNumber")
          .notEmpty()
          .withMessage("Mobile number is required")
          .isMobilePhone("any")
          .withMessage("Invalid mobile number"),
        check("gender")
          .notEmpty()
          .withMessage("Gender is required")
          .isIn(Object.values(Gender))
          .withMessage("Invalid gender"),
        check("dateOfJoin")
          .notEmpty()
          .withMessage("Date of join is required")
          .isDate()
          .withMessage("Invalid date of join"),
        check("dateOfBirth")
          .notEmpty()
          .withMessage("Date of birth is required")
          .isDate()
          .withMessage("Invalid date of birth"),
        check("emergencyContact")
          .notEmpty()
          .withMessage("Emergency contact is required")
          .isMobilePhone("any")
          .withMessage("Invalid mobile number"),
        check("address.street1").notEmpty().withMessage("Street1 is required"),
        check("address.city").notEmpty().withMessage("City is required"),
        check("address.zipCode")
          .notEmpty()
          .withMessage("Zip code is required")
          .isPostalCode("any")
          .withMessage("Invalid postal code"),
        check("address.country").notEmpty().withMessage("Country is required"),
        check("leave.*.leaveType")
          .optional()
          .isIn(Object.values(LeaveType))
          .withMessage("Invalid leave type"),
        check("leave.*.days")
          .optional()
          .isInt({ min: 0 })
          .withMessage("Invalid number of days for leave"),
      ];
    }

    case "tehcnician:modify": {
      return [
        check("company")
          .optional()
          .isMongoId()
          .withMessage("Company ID must be a valid MongoDB ID"),
        check("firstName").optional(),
        check("lastName").optional(),
        check("technicianNo").optional(),
        check("email")
          .optional()
          .isEmail()
          .withMessage("Invalid email address"),
        check("mobileNumber")
          .optional()
          .isMobilePhone("any")
          .withMessage("Invalid mobile number"),
        check("gender")
          .optional()
          .isIn(Object.values(Gender))
          .withMessage("Invalid gender"),
        check("dateOfJoin")
          .optional()
          .isDate()
          .withMessage("Invalid date of join"),
        check("dateOfBirth")
          .optional()
          .isDate()
          .withMessage("Invalid date of birth"),
        check("emergencyContact")
          .optional()
          .isMobilePhone("any")
          .withMessage("Invalid mobile number"),
        check("address.street1").optional(),
        check("address.city").optional(),
        check("address.zipCode")
          .optional()
          .isPostalCode("any")
          .withMessage("Invalid postal code"),
        check("address.country").optional(),
        check("leave.*.leaveType")
          .optional()
          .isIn(Object.values(LeaveType))
          .withMessage("Invalid leave type"),
        check("leave.*.days")
          .optional()
          .isInt({ min: 0 })
          .withMessage("Invalid number of days for leave"),
      ];
    }

    case "geofence:add": {
      function checkPointCoordinates(coordinates: any) {
        console.log(coordinates);
        return (
          Array.isArray(coordinates) &&
          coordinates.length === 2 &&
          coordinates.every((coord) => typeof coord === "number")
        );
      }

      function checkLineStringCoordinates(coordinates: any) {
        console.log(coordinates);
        return (
          Array.isArray(coordinates) &&
          coordinates.every(
            (coord) =>
              Array.isArray(coord) &&
              coord.length === 2 &&
              coord.every((coordValue) => typeof coordValue === "number")
          )
        );
      }

      function checkPolygonCoordinates(coordinates: any) {
        return (
          Array.isArray(coordinates) &&
          coordinates.every(
            (coord) =>
              Array.isArray(coord) &&
              coord.every(
                (subCoord) =>
                  Array.isArray(subCoord) &&
                  subCoord.length === 2 &&
                  subCoord.every((coordValue) => typeof coordValue === "number")
              )
          )
        );
      }

      function checkCircleCoordinates(coordinates: any) {
        return (
          Array.isArray(coordinates) &&
          coordinates.length === 2 &&
          coordinates.every((coord: any) => typeof coord === "number")
        );
      }

      return [
        check("company")
          .isMongoId()
          .withMessage("Company ID must be a valid MongoDB ObjectId"),
        check("name").notEmpty().withMessage("Name is required"),
        check("contactNumber")
          .notEmpty()
          .isMobilePhone("any")
          .withMessage("Enter valid mobile number"),
        check("category")
          .isIn(Object.values(CATEGORY))
          .withMessage("Invalid category"),
        check("geofenceAccess")
          .optional()
          .isIn(Object.values(GEOFENCE_ACCESS))
          .withMessage("Invalid geofence access type"),
        check("address")
          .optional()
          .isString()
          .withMessage("Address must be a string"),
        check("tolerance")
          .isNumeric()
          .withMessage("Tolerance must be a number"),
        check("description")
          .optional()
          .isString()
          .withMessage("Description must be a string"),

        check("location")
          .isArray({ min: 1 })
          .withMessage("Location array must contain at least one location"),

        check("location.*.type")
          .isIn(Object.values(GEOFENCE_TYPE))
          .withMessage("Invalid location type"),

        check("location.*.coordinates")
          .custom((coordinates, { req }) => {
            const locationType = req.body.location.find((loc: any) => loc.type);
            if (!locationType) {
              return false;
            }
            // if (locationType.type === GEOFENCE_TYPE.Point) {
            //   return checkPointCoordinates(coordinates);
            // } else if (locationType.type === GEOFENCE_TYPE.Line) {
            //   return checkLineStringCoordinates(coordinates);
            // } else if (locationType.type === GEOFENCE_TYPE.Polygon) {
            //   return checkLineStringCoordinates(coordinates);
            // } else if (locationType.type === GEOFENCE_TYPE.Circle) {
            //   return checkCircleCoordinates(coordinates);
            // }

            return true;
          })
          .withMessage("Invalid coordinates for the specified location type"),
      ];
    }

    case "geofence:update": {
      function checkPointCoordinates(coordinates: any) {
        console.log(coordinates);
        return (
          Array.isArray(coordinates) &&
          coordinates.length === 2 &&
          coordinates.every((coord) => typeof coord === "number")
        );
      }

      function checkLineStringCoordinates(coordinates: any) {
        return (
          Array.isArray(coordinates) &&
          coordinates.every(
            (coord) =>
              Array.isArray(coord) &&
              coord.length === 2 &&
              coord.every((coordValue) => typeof coordValue === "number")
          )
        );
      }

      function checkPolygonCoordinates(coordinates: any) {
        return (
          Array.isArray(coordinates) &&
          coordinates.every(
            (coord) =>
              Array.isArray(coord) &&
              coord.every(
                (subCoord) =>
                  Array.isArray(subCoord) &&
                  subCoord.length === 2 &&
                  subCoord.every((coordValue) => typeof coordValue === "number")
              )
          )
        );
      }

      function checkCircleCoordinates(coordinates: any) {
        console.log(coordinates);
        return (
          Array.isArray(coordinates) &&
          coordinates.length === 2 &&
          coordinates.every((coord: any) => typeof coord === "number")
        );
      }

      return [
        check("company")
          .optional()
          .isMongoId()
          .withMessage("Company ID must be a valid MongoDB ObjectId"),
        check("name").optional().notEmpty().withMessage("Name is required"),
        check("contactNumber")
          .optional()
          .isMobilePhone("any")
          .withMessage("Enter valid mobile number"),
        check("category")
          .optional()
          .isIn(Object.values(CATEGORY))
          .withMessage("Invalid category"),
        check("geofenceAccess")
          .optional()
          .isIn(Object.values(GEOFENCE_ACCESS))
          .withMessage("Invalid geofence access type"),
        check("address")
          .optional()
          .isString()
          .withMessage("Address must be a string"),
        check("tolerance")
          .optional()
          .isNumeric()
          .withMessage("Tolerance must be a number"),
        check("description")
          .optional()
          .isString()
          .withMessage("Description must be a string"),

        check("location.*.type")
          .optional()
          .isIn(Object.values(GEOFENCE_TYPE))
          .withMessage("Invalid location type"),

        check("location.*.coordinates")
          .optional()
          .custom((coordinates, { req }) => {
            // const locationType = req.body.location.find((loc: any) => loc.type);

            // if (!locationType) {
            //   return false;
            // }
            // if (locationType.type === GEOFENCE_TYPE.Point) {
            //   return checkPointCoordinates(coordinates);
            // } else if (locationType.type === GEOFENCE_TYPE.Line) {
            //   return checkLineStringCoordinates(coordinates);
            // } else if (locationType.type === GEOFENCE_TYPE.Polygon) {
            //   return checkPolygonCoordinates(coordinates);
            // } else if (locationType.type === GEOFENCE_TYPE.Circle) {
            //   return checkCircleCoordinates(coordinates);
            // }
            return true;
          })
          .withMessage("Invalid coordinates for the specified location type"),
      ];
    }

    case "expense:add": {
      return [
        check("branch")
          .exists()
          .withMessage("Branch ID is required")
          .isMongoId()
          .withMessage("Branch ID must be a valid MongoDB ObjectId"),

        check("category")
          .notEmpty()
          .withMessage("Category is required")
          .isIn(Object.values(Category))
          .withMessage("Invalid category"),

        check("type")
          .notEmpty()
          .withMessage("Type is required")
          .isIn(Object.values(ExpenseType))
          .withMessage("Invalid expense type"),

        check("expenseDate")
          .notEmpty()
          .withMessage("Expense Date is required")
          .isISO8601()
          .withMessage("Enter valid date"),

        check("amount")
          .notEmpty()
          .withMessage("Amount is required")
          .isNumeric()
          .withMessage("Amount must be a number"),

        check("referenceNumber")
          .notEmpty()
          .withMessage("Reference number is required"),

        check("workHour")
          .optional()
          .isString()
          .withMessage("Invalid work hour format"),

        check("fromDate")
          .optional()
          .isISO8601()
          .withMessage("Invalid from date format"),

        check("toDate")
          .optional()
          .isISO8601()
          .withMessage("Invalid to date format"),

        check("odometer")
          .optional()
          .isNumeric()
          .withMessage("Odometer reading must be a number"),
      ];
    }

    case "expense:update": {
      return [
        check("branchId")
          .optional()
          .isMongoId()
          .withMessage("Driver ID must be a valid MongoDB ObjectId"),

        check("category")
          .optional()
          .isIn(Object.values(Category))
          .withMessage("Invalid category"),

        check("type")
          .optional()
          .isIn(Object.values(ExpenseType))
          .withMessage("Invalid expense type"),

        check("amount")
          .optional()
          .isNumeric()
          .withMessage("Amount must be a number"),

        check("amount")
          .optional()
          .isNumeric()
          .withMessage("Amount must be a number"),

        check("referenceNumber").optional(),

        check("workHour")
          .optional()
          .isISO8601()
          .withMessage("Invalid work hour format"),

        check("fromDate")
          .optional()
          .isISO8601()
          .withMessage("Invalid from date format"),

        check("toDate")
          .optional()
          .isISO8601()
          .withMessage("Invalid to date format"),

        check("odometer")
          .optional()
          .isNumeric()
          .withMessage("Odometer reading must be a number"),

        check("createdBy")
          .optional()
          .isMongoId()
          .withMessage("Created by user ID must be a valid MongoDB ObjectId"),
      ];
    }

    case "alert:add": {
      return [
        check("branch")
          .isArray()
          .withMessage("Branch must be an array")
          .notEmpty()
          .withMessage("Branch is required")
          .custom((branchArray: string[]) => {
            if (branchArray.some((id) => !mongoose.isObjectIdOrHexString(id))) {
              throw new Error("Each branch ID must be a valid ObjectId or hex string");
            }
            return true;
          })
          .withMessage("Invalid branch format"),
        check("object")
          .exists()
          .notEmpty()
          .withMessage("Object is required")
          .isString()
          .withMessage("Object must be a string"),
        check("objectGroup")
          .exists()
          .withMessage("Object group is required")
          .isString()
          .withMessage("Object group must be a string"),
        check("alertName")
          .exists()
          .notEmpty()
          .withMessage("Alert name is required")
          .isString()
          .withMessage("Alert name must be a string"),
        check("alertType")
          .exists()
          .notEmpty()
          .withMessage("Alert type is required")
          .isString()
          .withMessage("Alert type must be a string"),
        check("severity")
          .exists()
          .notEmpty()
          .withMessage("Severity is required")
          .isString()
          .withMessage("Severity must be a string"),
        check("basedOn")
          .exists()
          .notEmpty()
          .withMessage("Based on is required")
          .isString()
          .withMessage("Based on must be a string"),
        check("value")
          .exists()
          .notEmpty()
          .withMessage("Value is required")
          .isString()
          .withMessage("Value must be a string"),
        check("validDays")
          .exists()
          .notEmpty()
          .withMessage("Valid days is required")
          .isString()
          .withMessage("Valid days must be a string"),
        check("action")
          .isObject()
          .withMessage("Action must be an object")
          .custom((action) => {
            const validKeys = ["Email", "SMS", "Notification"];
            for (const key of Object.keys(action)) {
              if (!validKeys.includes(key) || typeof action[key] !== "boolean") {
                throw new Error("Action must contain valid boolean keys: Email, SMS, Notification");
              }
            }
            return true;
          })
          .withMessage("Invalid action format"),
      ];
    }

    case "alert:update": {
      return [
        check("branch")
          .isArray()
          .withMessage("Branch must be an array")
          .notEmpty()
          .withMessage("Branch is required")
          .custom((branchArray: string[]) => {
            if (branchArray.some((id) => !mongoose.isObjectIdOrHexString(id))) {
              throw new Error("Each branch ID must be a valid ObjectId or hex string");
            }
            return true;
          })
          .withMessage("Invalid branch format"),
        check("object")
          .optional()
          .isString()
          .withMessage("Object must be a string"),
        check("objectGroup")
          .optional()
          .isString()
          .withMessage("Object group must be a string"),
        check("alertName")
          .optional()
          .isString()
          .withMessage("Alert name must be a string"),
        check("alertType")
          .optional()
          .isString()
          .withMessage("Alert type must be a string"),
        check("severity")
          .optional()
          .isString()
          .withMessage("Severity must be a string"),
        check("basedOn")
          .optional()
          .isString()
          .withMessage("Based on must be a string"),
        check("value")
          .optional()
          .isString()
          .withMessage("Value must be a string"),
        check("validDays")
          .optional()
          .isString()
          .withMessage("Valid days must be a string"),
        check("action")
          .optional()
          .isObject()
          .withMessage("Action must be an object")
          .custom((action) => {
            const validKeys = ["Email", "SMS", "Notification"];
            for (const key of Object.keys(action)) {
              if (!validKeys.includes(key) || typeof action[key] !== "boolean") {
                throw new Error("Action must contain valid boolean keys: Email, SMS, Notification");
              }
            }
            return true;
          }),
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
