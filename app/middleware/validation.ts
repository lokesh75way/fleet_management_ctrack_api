import { type Response, type Request, type NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import { check, validationResult } from "express-validator";
import createHttpError from "http-errors";
import { UserRole } from "../schema/User";
import {
  CostType,
  DistanceCounter,
  DocumentType,
  FuelSensor,
  FuelType,
  Permit,
  SpeedDetection,
  UnitOFDistance,
  VehicleCategory,
} from "../schema/Vehicle";

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

    case "group:update": {
      return [
        check("userName").optional(),

        check("groupName").optional(),

        check("email")
          .exists()
          .notEmpty()
          .bail()
          .withMessage("Email is required")
          .isEmail()
          .bail()
          .withMessage("Enter valid email"),

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

    case "company:add": {
      return [
        check("businessGroupId")
          .exists({ values: "falsy" })
          .bail()
          .withMessage("Business group required"),

        check("userName")
          .exists({ values: "falsy" })
          .bail()
          .withMessage("User name is required"),

        check("companyName")
          .exists({ values: "falsy" })
          .notEmpty()
          .bail()
          .withMessage("Company name is required"),

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

    case "company:update": {
      return [
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

        check("country").exists().notEmpty().withMessage("Country is required"),

        check("state").optional().notEmpty().withMessage("State is required"),

        check("city").exists().notEmpty().withMessage("City is required"),

        check("zipCode").optional().isPostalCode("any"),

        check("file").optional().isURL(),

        check("street1").exists().notEmpty().withMessage("Street1 is required"),

        check("street2").optional(),

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

    case "branch:update": {
      return [
        check("branchId")
          .exists({ values: "falsy" })
          .bail()
          .withMessage("Branch ID is required"),

        check("businessGroupId").optional(),

        check("companyId").optional(),

        check("parentBranchId").optional(),

        check("branchName").optional(),

        check("country").optional().optional(),

        check("state").optional().optional(),

        check("city").optional().optional(),

        check("zipCode").optional().isPostalCode("any"),

        check("file").optional().isURL(),

        check("street1").optional(),

        check("street2").optional(),

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
        check("branchId")
          .notEmpty()
          .withMessage("Branch ID is required")
          .isMongoId()
          .withMessage("Branch ID must be a valid MongoDB ObjectId"),
        check("vehicleName").notEmpty().withMessage("Vehicle name is required"),
        check("deviceType").optional(),
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
          .optional()
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
        check("unitOfDistance")
          .notEmpty()
          .withMessage("Unit of distance is required")
          .isIn(Object.values(UnitOFDistance))
          .withMessage("Invalid unit of distance value"),
        check("speedDetection")
          .optional()
          .isIn(Object.values(SpeedDetection))
          .withMessage("Invalid speed detection value"),
        check("deviceAccuracyTolerance")
          .optional()
          .isString()
          .withMessage("Device accuracy tolerance must be a string"),
        check("plateNumber").notEmpty().withMessage("Plate number is required"),
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
          .optional()
          .isNumeric()
          .withMessage("Purchase amount must be a number"),
        check("weightCapacity")
          .optional()
          .isNumeric()
          .withMessage("Weight capacity must be a number"),
        check("gpsInstallationDate")
          .optional()
          .isISO8601()
          .withMessage("GPS installation date must be a valid ISO 8601 date"),
        check("gpsWarranty")
          .optional()
          .isNumeric()
          .withMessage("GPS warranty must be a number"),
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
        check("distanceBaseFuelConsumption")
          .optional()
          .isNumeric()
          .withMessage("Distance base fuel consumption must be a number"),
        check("durationBaseFuelConsumption")
          .optional()
          .isNumeric()
          .withMessage("Duration base fuel consumption must be a number"),
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
        check("distance")
          .optional()
          .isNumeric()
          .withMessage("Distance must be a number"),
        check("duration")
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
      ];
    }

    case "vehicle:update": {
      return [
        check("businessGroupId")
          .optional()
          .isMongoId()
          .withMessage("Business group ID must be a valid MongoDB ObjectId"),
        check("companyId")
          .optional()
          .isMongoId()
          .withMessage("Company ID must be a valid MongoDB ObjectId"),
        check("branchId")
          .optional()
          .isMongoId()
          .withMessage("Branch ID must be a valid MongoDB ObjectId"),
        check("vehicleName").optional(),
        check("deviceType").optional(),
        check("imeiNumber")
          .optional()
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
          .optional()
          .isIn(Object.values(DistanceCounter))
          .withMessage("Invalid distance counter value"),
        check("unitOfDistance")
          .optional()
          .isIn(Object.values(UnitOFDistance))
          .withMessage("Invalid unit of distance value"),
        check("speedDetection")
          .optional()
          .isIn(Object.values(SpeedDetection))
          .withMessage("Invalid speed detection value"),
        check("deviceAccuracyTolerance")
          .optional()
          .isString()
          .withMessage("Device accuracy tolerance must be a string"),
        check("plateNumber").optional(),
        check("vehicleCategory")
          .optional()
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
        check("weightCapacity")
          .optional()
          .isNumeric()
          .withMessage("Weight capacity must be a number"),
        check("gpsInstallationDate")
          .optional()
          .isISO8601()
          .withMessage("GPS installation date must be a valid ISO 8601 date"),
        check("gpsWarranty")
          .optional()
          .isNumeric()
          .withMessage("GPS warranty must be a number"),
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
        check("distanceBaseFuelConsumption")
          .optional()
          .isNumeric()
          .withMessage("Distance base fuel consumption must be a number"),
        check("durationBaseFuelConsumption")
          .optional()
          .isNumeric()
          .withMessage("Duration base fuel consumption must be a number"),
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
        check("distance")
          .optional()
          .isNumeric()
          .withMessage("Distance must be a number"),
        check("duration")
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
          .optional()
          .isIn(Object.values(DocumentType))
          .withMessage("Invalid document type value"),
        check("documents.*.file").optional(),
        check("documents.*.issueDate").optional(),
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
