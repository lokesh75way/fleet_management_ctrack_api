import mongoose, { Types } from "mongoose";
import { type BaseSchema } from "./index";
// import  mongoose_delete , {SoftDeleteModel}  from 'mongoose-delete';
import { IUser } from "./User";


const Schema = mongoose.Schema;

export interface IBusinessGroup extends BaseSchema {
  groupName: string;
  logo: string;

  tradeLicenseNumber : string;
  officeNumber  :string;

  dateFormat: string;
  timeFormat: string;

  timezone: string;
  createdBy: Types.ObjectId | IUser;
}

const BusinessGroupSchema = new Schema<IBusinessGroup>(
  {
    groupName: { type: String , unique: true },
    logo: { type: String },

    tradeLicenseNumber: { type: String },
    officeNumber: { type: String},
   
    dateFormat: { type: String, enum: ["MM-DD-YYYY","DD-MM-YYYY"] },
    timeFormat: { type: String, enum : ["12 Hour","24 Hour"] },
   
    timezone: { type: String },
    createdBy: { type: mongoose.Types.ObjectId, ref: "user" },
  },
  { timestamps: true }
);

// BusinessGroupSchema.plugin(mongoose_delete , { deletedBy: true, deletedByType: String })

export default mongoose.model<IBusinessGroup>(
  "business-group",
  BusinessGroupSchema
);
