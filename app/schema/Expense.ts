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
  branch: Types.ObjectId | IBranch;
  category: Category;
  type: ExpenseType;
  amount: number;
  expenseDate : Date;
  referenceNumber: string;
  bill: string;
  description: string;
  billUpload: string;
  odometer: string;
  workHour : string;
  fromDate : Date;
  toDate : Date;
  createdBy: Types.ObjectId | IUser;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    branch: {
      type: mongoose.Types.ObjectId,
      ref: "company-branch",
    },
    category: { type: String, enum: Object.values(Category), required: true },
    type: { type: String, enum: Object.values(ExpenseType), required: true },
    amount: {
      type: Number,
      required: true,
    },
    expenseDate : {
      type : Date , 
      required : true
    },
    referenceNumber: {
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
      type : String,
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
