import mongoose, { type Types } from "mongoose";
import { type BaseSchema } from "./index";
import CompanyBranch, { IBranch } from "./CompanyBranch";

const Schema = mongoose.Schema;

export enum BasedOn {
  VEHICLE = "VEHICLE",
  VEHICLE_GROUP = "VEHICLE_GROUP",
  VEHICLE_TYPE = "VEHICLE_TYPE",
}

export enum AlertValue {
  START = "START",
  CANCEL = "CANCEL",
  BOTH = "BOTH",
}

export enum ValidDays {
  EVERYDAY = "EVERYDAY",
  CUSTOM = "CUSTOM",
}

export enum Severity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum AlertTypes {
  EMERG_911 = "911",
  CRASH_DETECTION = "Crash Detection",
  BLE_BATTERY_SENSOR1 = "BLE Battery Sensor1",
  BLE_BATTERY_SENSOR2 = "BLE Battery Sensor2",
  BLE_BATTERY_SENSOR3 = "BLE Battery Sensor3",
}

export interface IAlert extends BaseSchema {
  branch: Types.ObjectId | IBranch;
  basedOn: BasedOn;
  object: string;
  objectGroup: string;
  alertName: string;
  alertType: string;
  value: AlertValue;
  validDays: ValidDays;
  validFrom: Date;
  validTo: Date;
  action: string;
  isDeleted: boolean;
  severity: Severity;
}

const AlertSchema = new Schema<IAlert>(
  {
    branch: {
      type: mongoose.Types.ObjectId,
      ref: CompanyBranch.modelName,
    },
    basedOn: {
      type: String,
      enum: Object.values(BasedOn),
    },
    object: {
      type: String,
    },
    objectGroup: {
      type: String,
    },
    alertName: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    alertType: {
      type: String,
      enum: Object.values(AlertTypes),
    },
    value: { type: String, enum: Object.values(AlertValue) },
    validDays: { type: String, enum: Object.values(ValidDays) },
    validFrom: { type: Date },
    validTo: { type: Date },
    action: {
      SMS: { type: Boolean },
      Email: { type: Boolean },
      Notification: { type: Boolean },
    },
    severity: { type: String, enum: Object.values(Severity) },
  },
  { timestamps: true }
);


export default mongoose.model<IAlert>("alert", AlertSchema);
