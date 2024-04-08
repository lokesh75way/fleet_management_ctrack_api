import mongoose, { Schema, Types } from "mongoose";
import { type BaseSchema } from "./index";
import { ICompany } from "./Company";


import  MongooseDelete , { SoftDeleteModel }  from 'mongoose-delete';

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export enum VerificationMethod {
  OTP = "OTP",
  PASSWORD = "PASSWORD",
}

export enum OtpDeliveryMethod {
  SMS = "SMS",
  EMAIL = "EMAIL",
}

export enum LeaveType {
  CASUAL = "CASUAL",
  SICK = "SICK",
  PRIVILEGE = "PRIVILEGE",
}

export interface ITechnician extends BaseSchema {
  company: Types.ObjectId | ICompany,

  firstName: string;
  middleName?: string;
  lastName: string;
  isActive: boolean;
  technicianNo: string;
  email: string;
  password: string;
  mobileNumber: number;
  gender: Gender;
  emergencyContact: number;
  dateOfJoin: Date;
  dateOfBirth: Date;
  address: {
    street1: string;
    street2: string;
    city: string;
    zipCode: string;
    country: string;
    mediclaimNumber: string;
    mediclaimExpiryDate: string;
  };
  leave: {
    leaveType: LeaveType;
    days: Number;
  }[];
  createdBy : Types.ObjectId
}

const TechnicianSchema = new Schema<ITechnician>(
  {
    company: { type: Schema.Types.ObjectId, ref : "company",required: true },
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    isActive: { type: Boolean , default : true },
    technicianNo: { type: String, required : true , unique : true},
    email: { type: String, required: true, unique: true },
    password: { type: String },
    mobileNumber: { type: Number, required: true , unique: true},
    gender: { type: String, enum: Object.values(Gender), required: true },
    emergencyContact: { type: Number , required : true},
    dateOfJoin: { type: Date , required : true},
    dateOfBirth: { type: Date, required : true },
    address: {
      street1: { type: String },
      street2: { type: String },
      city: { type: String  , required: true},
      zipCode: { type: String , required: true },
      country: { type: String , required: true},
      mediclaimNumber: { type: String },
      mediclaimExpiryDate: { type: String },
    },
    leave: [
      {
        leaveType: { type: String , enum : Object.values(LeaveType) },
        days: { type: Number },
      },
    ],
    createdBy : {type : Schema.Types.ObjectId ,ref : "user" }
  },
  {
    timestamps: true,
  }
);


TechnicianSchema.plugin(MongooseDelete, {deletedBy : true , deletedByType : String})

export default mongoose.model("technician", TechnicianSchema);
