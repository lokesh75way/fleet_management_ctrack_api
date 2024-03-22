import mongoose, { type Types } from "mongoose";
import { type BaseSchema } from "./index";
import { IUser } from "./User";

const Schema = mongoose.Schema;

export interface IModule extends BaseSchema {
    module: string;
    title: string;
    basePath: string;
    parentModuleId: Types.ObjectId | IModule;
}

const ModulesNameSchema = new Schema<IModule>(
  {
    module: { 
      type: String
    },
    title: { 
        type: String
    },
    basePath: { 
        type: String
    },
    parentModuleId: { 
        type: mongoose.Types.ObjectId,
        ref: "module"
    },
  },
  { timestamps: true }
);


export default mongoose.model<IModule>("module", ModulesNameSchema);
