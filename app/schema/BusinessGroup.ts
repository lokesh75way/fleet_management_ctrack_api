import mongoose, { Types } from "mongoose";
import { type BaseSchema } from "./index";
// import  mongoose_delete , {SoftDeleteModel}  from 'mongoose-delete';
import { IUser } from "./User";

enum UnitOfDistance {
 MILES =  "MILES",
 KILOMETERS =  "KILOMETERS",
 NAUTICAL_MILES =  "NAUTICAL_MILES"
}

enum UnitOfFuel {
  GALLONS = "GALLONS",
  LITERS = "LITERS"
}

enum Language {
 ENGLISH =  "ENGLISH",
 FRENCH =  "FRENCH",
 ARABIC = "ARABIC",
 PORTUGUESE =  "PORTUGUESE"
}

enum WeekDays {
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
}

const Schema = mongoose.Schema;

export interface IBusinessGroup extends BaseSchema {
  groupName: string;
  logo: string;
  helpDeskEmail: string;
  helpDeskTelephoneNumber: string;
  whatsappContactNumber: string;
  // address
  country: string;
  state: string;
  city: string;
  zipCode: string;
  street1: string;
  street2: string;
  contactPerson: string;
  faxNumber: string;
  capacity: String;
  // setting
  status : string;
  dateFormat: string;
  timeFormat: string;
  unitOfDistance: string;
  unitOfFuel: string;
  language: string;
  workStartDay: string;
  currency: string;
  timezone: string;
  file: string;
  createdBy: Types.ObjectId | IUser;
}

const BusinessGroupSchema = new Schema<IBusinessGroup>(
  {
    groupName: { type: String , unique: true },
    logo: { type: String },
    helpDeskEmail: { type: String },
    helpDeskTelephoneNumber: { type: String , required : true },
    whatsappContactNumber: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    zipCode: { type: String },
    street1: { type: String },
    street2: { type: String },
    contactPerson: { type: String },
    faxNumber: { type: String },
    status : {type : String , enum : ["INACTIVE","ACTIVE"]},
    dateFormat: { type: String, enum: ["MM-DD-YYYY","DD-MM-YYYY"] },
    timeFormat: { type: String, enum : ["12 Hour","24 Hour"] },
    unitOfDistance: { type: String , enum : UnitOfDistance },
    unitOfFuel: { type: String , enum : UnitOfFuel },
    language: { type: String , enum : Language },
    capacity: { type: String },
    workStartDay: { type: String , enum : WeekDays },
    currency: { type: String },
    timezone: { type: String },
    file: { type: String },
    createdBy: { type: mongoose.Types.ObjectId, ref: "user" },
  },
  { timestamps: true }
);

// BusinessGroupSchema.plugin(mongoose_delete , { deletedBy: true, deletedByType: String })

export default mongoose.model<IBusinessGroup>(
  "business-group",
  BusinessGroupSchema
);
