import mongoose, { type Types } from "mongoose";
import { type BaseSchema } from "./index";
import { IBranch } from "./CompanyBranch";
import { IUser } from "./User";
import MongooseDelete from "mongoose-delete";

const Schema = mongoose.Schema;

enum ExpenseType {
  ACCIDENT = "ACCIDENT",
  BONUS = "BONUS",
}

enum Category {
  VARIABLE = "VARIABLE",
  FIX = "FIX",
}

export interface IExpense extends BaseSchema {
  branchId: Types.ObjectId | IBranch;
  category: Category;
  type: ExpenseType;
  amount: number;
  refrenceNumber: string;
  bill: string;
  description: string;
  billUpload: string;
  odometer: string;
  createdBy: Types.ObjectId | IUser;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    branchId: {
      type: mongoose.Types.ObjectId,
      ref: "company-branch",
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
