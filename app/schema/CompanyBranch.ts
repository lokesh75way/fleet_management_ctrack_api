import mongoose, { Schema, Types } from "mongoose";
import { type BaseSchema } from "./index";
import { Currency, IBusinessGroup, WorkStartDay } from "./BusinessGroup";
import { ICompany } from "./Company";
import { IUser } from "./User";

interface UserInfo {
  email?: string;
  name?: string;
  designation?: string;
  mobileNumber?: string;
}

export interface IBranch extends BaseSchema {
  businessGroupId: Types.ObjectId | IBusinessGroup;
  companyId: Types.ObjectId | ICompany;
  parentBranchId: Types.ObjectId | IBranch;
  branchName: string;
  logo: string;

  tradeLicenseNumber: string;
  officeNumber: string;

  workStartDay: WorkStartDay;
  currency: Currency;

  userInfo: UserInfo[];
  email: string;
  country: string;
  state: string;
  city: string;

  isDeleted: boolean;

  timezone: string;
  dateFormat: string;
  timeFormat: string;

  createdBy: Types.ObjectId | IUser;
}

const BranchSchema = new Schema<IBranch>(
  {
    branchName: { type: String, required: true },
    logo: { type: String },
    businessGroupId: {
      type: Schema.Types.ObjectId,
      ref: "business-group",
      required: true,
    },
    companyId: { type: Schema.Types.ObjectId, ref: "company", required: true },
    parentBranchId: {
      type: Schema.Types.ObjectId,
      ref: "company-branch",
      required: false,
    },

    isDeleted: { type: Boolean, default: false },

    tradeLicenseNumber: { type: String },
    officeNumber: { type: String },

    workStartDay: {
      type: String,
      enum: Object.values(WorkStartDay),
      default: WorkStartDay.MONDAY,
    },
    currency: { type: String, enum: Object.values(Currency) },

    userInfo: [
      {
        email: { type: String, required: false, unique: false },
        name: { type: String, required: false },
        designation: { type: String, required: false },
        mobileNumber: { type: String, required: false, unique: false },
      },
    ],
    email: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },

    dateFormat: { type: String, enum: ["MM-DD-YYYY", "DD-MM-YYYY"] },
    timeFormat: { type: String, enum: ["12 Hour", "24 Hour"] },

    timezone: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "user", required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBranch>("company-branch", BranchSchema);
