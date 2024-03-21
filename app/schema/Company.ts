import mongoose, { Schema, Types } from "mongoose";
import { type BaseSchema } from "./index";
import { IUser } from "./User";

export interface ICompany extends BaseSchema {
  businessGroupId: Types.ObjectId | IUser;
  companyName: string;
  logo: string;
  // address
  country: string;
  state: string;
  city: string;
  zipCode: string;
  street1: string;
  street2: string;
  contactPerson: string;
  faxNumber: string;
  // setting
  dateFormat: string;
  timeFormat: string;
  unitOfDistance: string;
  unitOfFuel: string;
  createdBy: Types.ObjectId | IUser;
}

const CompanySchema = new Schema<ICompany>(
  {
    businessGroupId: { type: Schema.Types.ObjectId, ref: "business-group", required: true },
    companyName: { type: String, required: true },
    logo: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    zipCode: { type: String },
    street1: { type: String },
    street2: { type: String },
    contactPerson: { type: String },
    faxNumber: { type: String },
    dateFormat: { type: String },
    timeFormat: { type: String },
    unitOfDistance: { type: String },
    unitOfFuel: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "user", required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICompany>("company", CompanySchema);


