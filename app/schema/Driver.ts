import mongoose, { Schema, Types } from "mongoose";
import { type BaseSchema } from "./index";
import BusinessGroup, { IBusinessGroup } from "./BusinessGroup";
import Company, { ICompany } from "./Company";
import CompanyBranch, { IBranch } from "./CompanyBranch";

// Define enums
export enum DocumentType {
  DRIVING_LICENSE = "DRIVING_LICENSE",
  AADHAR_CARD = "AADHAR_CARD",
  PAN_CARD = "PAN_CARD",
  BANK_ACCOUNT = "BANK_ACCOUNT",
  MEDICLAIM = "MEDICLAIM",
}

export interface IDriver extends BaseSchema {
  businessGroupId: Types.ObjectId | IBusinessGroup;
  companyId: Types.ObjectId | ICompany;
  branchId: Types.ObjectId | IBranch;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  street1: string;
  street2: string;
  city: string;
  zipCode: string;
  state: string;
  country: string;
  contact1: string;
  contact2?: string;
  dateOfBirth: Date;
  age: number;
  dateOfJoining: Date;
  dateOfLeaving: Date;
  drivingExperience: number;
  licenseAvailable: boolean;
  licenseNumber: string;
  licenseToDriver: string;
  licenseIssueDate: Date;
  licenseExpiryDate: Date;
  lifeInsuranceNumber: string;
  lifeInsuranceExpiry: Date;
  mediclaimNumber: string;
  mediclaimExpiry: Date;
  active: boolean;
  documents: {
    documentType: DocumentType;
    file: string;
    issueDate: Date;
    expireDate: Date;
  }[];
  isDeleted: boolean;
}

const DeviceSchema = new Schema<IDriver>(
  {
    businessGroupId: {
      type: Schema.Types.ObjectId,
      ref: BusinessGroup.modelName,
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: Company.modelName,
      required: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: CompanyBranch.modelName,
      required: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    employeeNumber: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    zipCode: { type: String },
    street1: { type: String },
    street2: { type: String },
    contact1: { type: String, required: true },
    contact2: { type: String },
    dateOfBirth: { type: Date , required : true },
    age: { type: Number },
    dateOfJoining: { type: Date },
    dateOfLeaving: { type: Date },
    drivingExperience: { type: Number },
    licenseAvailable: { type: Boolean  , required : true},
    licenseNumber: { type: String },
    licenseToDriver: { type: String },
    licenseIssueDate: { type: Date  , required : true },
    licenseExpiryDate: { type: Date  , required : true },
    lifeInsuranceNumber: { type: String },
    lifeInsuranceExpiry: { type: Date },
    mediclaimNumber: { type: String },
    mediclaimExpiry: { type: Date },
    active: { type: Boolean },
    documents: [
      {
        documentType: { type: String, enum: Object.values(DocumentType) },
        file: { type: String },
        issueDate: { type: Date },
        expireDate: { type: Date },
      },
    ],
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDriver>("driver", DeviceSchema);
