import mongoose, { type Types } from "mongoose";
import { type BaseSchema } from "./index";
import { IBranch } from "./CompanyBranch";

const Schema = mongoose.Schema;

enum ExpenseType {
    ACCIDENT = "ACCIDENT",
    BONUS = "BONUS",
}

enum Category {
    VARIABLE = 'VARIABLE',
    FIX = 'FIX',
}

export interface IExpense extends BaseSchema {
  branchId: Types.ObjectId | IBranch;
  category: Category;
  type: ExpenseType;
  amount: number;
  refrenceNumber: string;
  bill: string;
  description: string;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    branchId: {
        type: mongoose.Types.ObjectId,
        ref: "company-branch"
    },
    category: { type: String, enum: Object.values(Category) },
    type: { type: String, enum: Object.values(ExpenseType) },
    amount: { 
        type: Number
    },
    refrenceNumber: { 
        type: String
    },
    bill: { 
        type: String
    },
    description: { 
        type: String
    },
  },
  { timestamps: true }
);


export default mongoose.model<IExpense>("expense", ExpenseSchema);
