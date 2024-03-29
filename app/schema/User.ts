import mongoose, { Types } from "mongoose";
import { type BaseSchema } from "./index";
import bcrypt from "bcrypt";
import { IBusinessGroup } from "./BusinessGroup";
import { IBranch } from "./CompanyBranch";
import { IVehicle } from "./Vehicle";
import { IPermission } from "./Permission";
import { ICompany } from "./Company";

import  MongooseDelete , { SoftDeleteModel }  from 'mongoose-delete';

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  BUSINESS_GROUP = "BUSINESS_GROUP",
  COMPANY = "COMPANY",
}

export enum UserType {
  ADMIN = "ADMIN",
  STAFF = "STAFF",
}

const Schema = mongoose.Schema;

export interface IUser extends BaseSchema {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  country: string;
  state: string;
  role: UserRole;
  type: UserType;
  isActive: boolean;
  isDeleted: boolean;
  password: string;
  isValidPassword: (password: string) => Promise<boolean>;
  businessGroupId: Types.ObjectId | IBusinessGroup;
  companyId?: Types.ObjectId | ICompany;
  branchIds?: Types.ObjectId[] | IBranch[];
  vehicleIds?: Types.ObjectId[] | IVehicle[];
  featureTemplateId?: Types.ObjectId | IPermission;
}

const UserSchema = new Schema<IUser>(
  {
    userName: { type: String, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    mobileNumber: { type: String, required: true, unique: true },
    country: { type: String },
    state: { type: String },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    password: { type: String, select: false },
    role: { type: String, enum: UserRole, default: UserRole.SUPER_ADMIN },
    type: { type: String, enum: UserType, default: UserType.STAFF },
    businessGroupId: { type: mongoose.Types.ObjectId, ref: "business-group" },
    companyId: { type: mongoose.Types.ObjectId, ref: "company" },
    branchIds: [{
      type: mongoose.Types.ObjectId,
      ref: "company-branch"
    }],
    vehicleIds: [{
      type: mongoose.Types.ObjectId,
      ref: "vechicle"
    }],
    featureTemplateId: { type: mongoose.Types.ObjectId, ref: "permission" },
  },
  { timestamps: true }
);


UserSchema.plugin(MongooseDelete, {deletedBy : true , deletedByType : String})


// save hashed password
UserSchema.pre("save", async function (next) {
  const hash = await bcrypt.hash(this.password, 12);
  this.password = hash;
  next();
});

// compare passwords
UserSchema.methods.isValidPassword = async function (password: string) {
  const compare = await bcrypt.compare(password, this.password);
  return compare;
};

export default mongoose.model<IUser>("user", UserSchema);
