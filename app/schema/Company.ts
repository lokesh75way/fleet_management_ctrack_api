import mongoose, { Schema, Types } from "mongoose";
import { type BaseSchema } from "./index";
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

export interface ICompany extends BaseSchema {
  businessGroupId: Types.ObjectId | IUser;
  companyName: string;
  logo: string;
  helpDeskEmail: string;
  helpDeskTelephoneNumber: string;
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
  capacity: string;
  // setting
  dateFormat: string;
  timeFormat: string;
  unitOfDistance: string;
  unitOfFuel: string;
  language: string;
  workStartDay: string;
  currency: string;
  timezone: string;
  status : string;
  file: string;
  createdBy: Types.ObjectId | IUser;
}

const CompanySchema = new Schema<ICompany>(
  {
    businessGroupId: {
      type: Schema.Types.ObjectId,
      ref: "business-group",
      required: true,
    },
    companyName: { type: String, required: true  },
    logo: { type: String },
    helpDeskEmail: { type: String },
    helpDeskTelephoneNumber: { type: String , required : true },
    whatsappNumber: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    zipCode: { type: String },
    street1: { type: String },
    street2: { type: String },
    contactPerson: { type: String },
    faxNumber: { type: String },
    status : {type : String , enum : ["INACTIVE","ACTIVE"]},
    dateFormat: { type: String, enum: ["MM-DD-YYYY", "DD-MM-YYYY"] },
    timeFormat: { type: String, enum: ["12 Hour", "24 Hour"] },
    unitOfDistance: { type: String, enum: UnitOfDistance },
    unitOfFuel: { type: String, enum: UnitOfFuel },
    language: { type: String, enum: Language },
    capacity: { type: String },
    workStartDay: { type: String, enum: WeekDays },
    currency: { type: String },
    timezone: { type: String },
    file: { type: String },
    createdBy: { type: mongoose.Types.ObjectId, ref: "user" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICompany>("company", CompanySchema);
