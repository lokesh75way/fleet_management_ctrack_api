import mongoose, { Schema, Types } from "mongoose";
import { type BaseSchema } from "./index";
import { IBusinessGroup } from "./BusinessGroup";
import { ICompany } from "./Company";
import { IUser } from "./User";

enum UnitOfDistance {
  MILES = "MILES",
  KILOMETERS = "KILOMETERS",
  NAUTICAL_MILES = "NAUTICAL_MILES",
}

enum UnitOfFuel {
  GALLONS = "GALLONS",
  LITERS = "LITERS",
}

enum Language {
  ENGLISH = "ENGLISH",
  FRENCH = "FRENCH",
  ARABIC = "ARABIC",
  PORTUGUESE = "PORTUGUESE",
}

enum WeekDays {
  SUNDAY = "SUNDAY",
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
}

export interface IBranch extends BaseSchema {
  businessGroupId: Types.ObjectId | IBusinessGroup,
  companyId: Types.ObjectId | ICompany,
  parentBranchId: Types.ObjectId | IBranch,
  branchName: string;
  logo: string;
  status : string;
  isActive : boolean;
  isDeleted : boolean;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  street1: string;
  street2: string;
  language : string;
  dateFormat: string;
  timeFormat: string;
  unitOfDistance: string;
  unitOfFuel: string;
  workStartDay: string;
  currency: string;
  timezone: string;
  file: string;
  createdBy : Types.ObjectId | IUser
}

const BranchSchema = new Schema<IBranch>(
  {
    branchName: { type: String, required: true },
    logo: { type: String },
    businessGroupId: { type: Schema.Types.ObjectId, ref: "business-group", required: true },
    companyId: { type: Schema.Types.ObjectId, ref: "company", required: true },
    parentBranchId: { type: Schema.Types.ObjectId, ref: "company-branch", required: false },
   
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },

    status : {type : String , enum : ["INACTIVE","ACTIVE"]},
    country: { type: String },
    state: { type: String },
    city: { type: String },
    zipCode: { type: String },
    street1: { type: String },
    street2: { type: String },
    dateFormat: { type: String, enum: ["MM-DD-YYYY", "DD-MM-YYYY"] },
    timeFormat: { type: String, enum: ["12 Hour", "24 Hour"] },
    unitOfDistance: { type: String, enum: UnitOfDistance },
    unitOfFuel: { type: String, enum: UnitOfFuel },
    language: { type: String, enum: Language },
    workStartDay: { type: String, enum: WeekDays },
    currency: { type: String },
    timezone: { type: String },
    file: { type: String },
    createdBy :  { type: Schema.Types.ObjectId, ref: "user", required: true }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBranch>("company-branch", BranchSchema);
