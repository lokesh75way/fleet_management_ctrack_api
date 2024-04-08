import mongoose, { type Types } from "mongoose";
import { type BaseSchema } from "./index";
import { IBranch } from "./CompanyBranch";
import { IUser } from "./User";
import MongooseDelete from "mongoose-delete";
import { IDriver } from "./Driver";

const Schema = mongoose.Schema;

export enum ExpenseType {
  ACCIDENT = "ACCIDENT",
  BONUS = "BONUS",
  BREAKDOWN = "BREAKDOWN",
  FINE = "FINE",
  MAINTAINENSE = "MAINTAINENSE",
  FUEL = "FUEL",
}

export enum Category {
  VARIABLE = "VARIABLE",
  FIX = "FIX",
}

export interface IExpense extends BaseSchema {
  driver: Types.ObjectId | IDriver;
  category: Category;
  type: ExpenseType;
  amount: number;
  refrenceNumber: string;
  bill: string;
  description: string;
  billUpload: string;
  odometer: string;
  workHour : Date;
  fromDate : Date;
  toDate : Date;
  createdBy: Types.ObjectId | IUser;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    driver: {
      type: mongoose.Types.ObjectId,
      ref: "driver",
    },
    category: { type: String, enum: Object.values(Category), required: true },
    type: { type: String, enum: Object.values(ExpenseType), required: true },
    amount: {
      type: Number,
      required: true,
    },
    refrenceNumber: {
      type: String,
      required: true,
    },
    bill: {
      type: String,
    },
    description: {
      type: String,
    },
    workHour : {
      type : Date
    },
    fromDate : {
      type :Date 
    }, 
    toDate : {
      type : Date
    },
    odometer : {
      type : String
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

ExpenseSchema.plugin(MongooseDelete, {
  deletedBy: true,
  deletedByType: String,
});


export default mongoose.model<IExpense>("expense", ExpenseSchema);
