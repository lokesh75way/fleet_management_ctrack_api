import mongoose, { type Types } from "mongoose";
import { type BaseSchema } from "./index";
import { IBranch } from "./CompanyBranch";

const Schema = mongoose.Schema;

enum BasedOn {
    VEHICLE = "VEHICLE",
    VEHICLE_GROUP = "VEHICLE_GROUP",
    VEHICLE_TYPE = "VEHICLE_TYPE",
}

enum AlertValue {
    START = "START",
    CANCEL = "CANCEL",
    BOTH = "BOTH",
}

enum ValidDays {
    EVERYDAY = "EVERYDAY",
    CUSTOM = "CUSTOM",
}

enum Severity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
  }

export interface IAlert extends BaseSchema {
  branchId: Types.ObjectId | IBranch;
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
  isDeleted : boolean;
  severity: Severity;
}

const AlertSchema = new Schema<IAlert>(
  {
    branchId: {
        type: mongoose.Types.ObjectId,
        ref: "company-branch"
    },
    basedOn: { 
        type: String
    },
    object: { 
        type: String
    },
    objectGroup: { 
        type: String
    },
    alertName: { 
        type: String
    },
    isDeleted : {
        type : Boolean,
        default : false
    },
    alertType: { 
        type: String
    },
    value: { type: String, enum: Object.values(AlertValue) },
    validDays: { type: String, enum: Object.values(ValidDays) },
    validFrom: { type: Date },
    validTo: { type: Date },
    action: { type: String },
    severity: { type: String, enum: Object.values(Severity) },
  },
  { timestamps: true }
);


export default mongoose.model<IAlert>("alert", AlertSchema);
