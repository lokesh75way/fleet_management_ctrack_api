import mongoose, { Mongoose, type Types } from "mongoose";
import { type BaseSchema } from "./index";

const Schema = mongoose.Schema;

export interface IModules extends BaseSchema {
  moduleId: Types.ObjectId | IModules;
  title: string;
  basePath: string;
}

const ModuleSchema = new Schema<IModules>(
  {
    moduleId: {
      type: mongoose.Types.ObjectId,
      ref: "module",
    },
    title: { type: String, required: true },
    basePath: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IModules>("module", ModuleSchema);
