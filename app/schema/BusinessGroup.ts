import mongoose, { Types } from "mongoose";
import { type BaseSchema } from "./index";
import { IUser } from "./User";

const Schema = mongoose.Schema;

export interface IBusinessGroup extends BaseSchema {
  groupName: string;
  logo: string;
  helpDeskEmail: string;
  helpDeskPhone: string;
  whatsappNumber: string;
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
  language: string;
  workStartDay: string;
  currency: string;
  timezone: string;
  createdBy: Types.ObjectId | IUser;
}

const BusinessGroupSchema = new Schema<IBusinessGroup>(
  {
    groupName: { type: String },
    logo: { type: String },
    helpDeskEmail: { type: String },
    helpDeskPhone: { type: String },
    whatsappNumber: { type: String },
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
    language: { type: String },
    workStartDay: { type: String },
    currency: { type: String },
    timezone: { type: String },
    createdBy: { type: mongoose.Types.ObjectId, ref: "user" },
  },
  { timestamps: true }
);



export default mongoose.model<IBusinessGroup>("business-group", BusinessGroupSchema);
