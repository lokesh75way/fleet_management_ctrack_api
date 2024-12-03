import mongoose, { Types } from "mongoose";
import { type BaseSchema } from "./index";
// import  mongoose_delete , {SoftDeleteModel}  from 'mongoose-delete';
import { IUser } from "./User";

export enum WorkStartDay {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export enum Currency {
  AED = "AED",
  USD = "USD",
  EURO = "EURO",
  XOF = "XOF",
  CFA = "CFA",
  DALASI = "DALASI",
  SHILLING = "SHILLING",
}

const Schema = mongoose.Schema;

export interface IBusinessGroup extends BaseSchema {
  groupName: string;
  logo: string;

  tradeLicenseNumber: string;
  officeNumber: string;

  workStartDay: WorkStartDay;
  currency: Currency;

  dateFormat: string;
  timeFormat: string;

  timezone: string;
  createdBy: Types.ObjectId | IUser;
  isDeleted: boolean;
}

const BusinessGroupSchema = new Schema<IBusinessGroup>(
  {
    groupName: { type: String, unique: true },
    logo: { type: String },

    tradeLicenseNumber: { type: String },
    officeNumber: { type: String },

    workStartDay: {
      type: String,
      enum: Object.values(WorkStartDay),
      default: WorkStartDay.MONDAY,
    },
    currency: { type: String, enum: Object.values(Currency) },

    dateFormat: { type: String, enum: ["MM-DD-YYYY", "DD-MM-YYYY"] },
    timeFormat: { type: String, enum: ["12 Hour", "24 Hour"] },

    timezone: { type: String },
    createdBy: { type: mongoose.Types.ObjectId, ref: "user" },
    isDeleted: {type: Boolean, default: false}
  },
  { timestamps: true }
);

// BusinessGroupSchema.plugin(mongoose_delete , { deletedBy: true, deletedByType: String })

export default mongoose.model<IBusinessGroup>(
  "business-group",
  BusinessGroupSchema
);
