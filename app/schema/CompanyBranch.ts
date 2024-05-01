import mongoose, { Schema, Types } from "mongoose";
import { type BaseSchema } from "./index";
import { IBusinessGroup } from "./BusinessGroup";
import { ICompany } from "./Company";
import { IUser } from "./User";


export interface IBranch extends BaseSchema {
  businessGroupId: Types.ObjectId | IBusinessGroup,
  companyId: Types.ObjectId | ICompany,
  parentBranchId: Types.ObjectId | IBranch,
  branchName: string;
  logo : string

  tradeLicenseNumber : string;
  officeNumber  :string;

 
  isDeleted : boolean;
 
  timezone :string;
  dateFormat: string;
  timeFormat: string;

  createdBy : Types.ObjectId | IUser
}

const BranchSchema = new Schema<IBranch>(
  {
    branchName: { type: String, required: true },
    logo: { type: String },
    businessGroupId: { type: Schema.Types.ObjectId, ref: "business-group", required: true },
    companyId: { type: Schema.Types.ObjectId, ref: "company", required: true },
    parentBranchId: { type: Schema.Types.ObjectId, ref: "company-branch", required: false },
   
    isDeleted: { type: Boolean, default: false },

    tradeLicenseNumber: { type: String },
    officeNumber: { type: String },


    dateFormat: { type: String, enum: ["MM-DD-YYYY", "DD-MM-YYYY"] },
    timeFormat: { type: String, enum: ["12 Hour", "24 Hour"] },
   
    timezone: { type: String },
    createdBy :  { type: Schema.Types.ObjectId, ref: "user", required: true }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBranch>("company-branch", BranchSchema);
