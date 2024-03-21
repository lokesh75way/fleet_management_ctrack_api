import mongoose, { Schema, Types } from "mongoose";
import { type BaseSchema } from "./index";
import { ICompany } from "./Company";

enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

enum VerificationMethod {
  OTP = "OTP",
  PASSWORD = "PASSWORD",
}

enum OtpDeliveryMethod {
  SMS = "SMS",
  EMAIL = "EMAIL",
}

enum LeaveType {
  CASUAL = "CASUAL",
  SICK = "SICK",
  PRIVILEGE = "PRIVILEGE",
}

export interface ITechnician extends BaseSchema {
  companyId: Types.ObjectId | ICompany,
  firstName: string;
  middleName?: string;
  lastName: string;
  isActive: boolean;
  isDeleted: boolean;
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
}

const TechnicianSchema = new Schema<ITechnician>(
  {
    companyId: { type: Schema.Types.ObjectId, required: true },
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    isActive: { type: Boolean },
    isDeleted: { type: Boolean },
    technicianNo: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    mobileNumber: { type: Number, required: true },
    gender: { type: String, enum: Object.values(Gender), required: true },
    emergencyContact: { type: Number },
    dateOfJoin: { type: Date },
    dateOfBirth: { type: Date },
    address: {
      street1: { type: String },
      street2: { type: String },
      city: { type: String },
      zipCode: { type: String },
      country: { type: String },
      mediclaimNumber: { type: String },
      mediclaimExpiryDate: { type: String },
    },
    leave: [
      {
        leaveType: { type: String , enum : Object.values(LeaveType) },
        days: { type: Number },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("technician", TechnicianSchema);
