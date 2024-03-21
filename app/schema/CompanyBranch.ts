import mongoose, { Schema, Types } from "mongoose";
import { type BaseSchema } from "./index";
import { IBusinessGroup } from "./BusinessGroup";
import { ICompany } from "./Company";

export interface IBranch extends BaseSchema {
  businessGroupId: Types.ObjectId | IBusinessGroup,
  companyId: Types.ObjectId | ICompany,
  parentBranchId: Types.ObjectId | IBranch,
  branchName: string;
  logo: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  street1: string;
  street2: string;
  dateFormat: string;
  timeFormat: string;
  unitOfDistance: string;
  unitOfFuel: string;
  isActive: boolean;
  isDeleted: boolean;
}

const BranchSchema = new Schema<IBranch>(
  {
    branchName: { type: String, required: true },
    logo: { type: String },
    businessGroupId: { type: Schema.Types.ObjectId, ref: "business-group", required: true },
    companyId: { type: Schema.Types.ObjectId, ref: "company", required: true },
    parentBranchId: { type: Schema.Types.ObjectId, ref: "company-branch", required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    zipCode: { type: String },
    street1: { type: String },
    street2: { type: String },
    dateFormat: { type: String },
    timeFormat: { type: String },
    unitOfDistance: { type: String },
    unitOfFuel: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBranch>("company-branch", BranchSchema);
