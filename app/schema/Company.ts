import mongoose, { Schema, Types } from "mongoose";
import { type BaseSchema } from "./index";
import { IUser } from "./User";
import { Currency, WorkStartDay } from "./BusinessGroup";

export interface ICompany extends BaseSchema {
  businessGroupId: Types.ObjectId | IUser;
  companyName: string;
  logo: string;
  // setting
  dateFormat: string;
  timeFormat: string;

  workStartDay: WorkStartDay;
  currency: Currency;

  tradeLicenseNumber: string;
  officeNumber: string;

  timezone: string;
  createdBy: Types.ObjectId | IUser;
  isDeleted: boolean;
}

const CompanySchema = new Schema<ICompany>(
  {
    businessGroupId: {
      type: Schema.Types.ObjectId,
      ref: "business-group",
      required: true,
    },
    companyName: { type: String, required: true },
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
  {
    timestamps: true,
  }
);

export default mongoose.model<ICompany>("company", CompanySchema);
