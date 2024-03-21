import mongoose, { type Types } from "mongoose";
import { type BaseSchema } from "./index";
import { IUser } from "./User";

const Schema = mongoose.Schema;

export interface IPermission extends BaseSchema {
  templateName: string;
  module: {
    moduleName: string;
    endPoint: string;
    add: boolean;
    view: boolean;
    modify: boolean;
    delete: boolean;
  }[]
}

const PermissionSchema = new Schema<IPermission>(
  {
    templateName: { 
      type: String
    },
    module: [{
      moduleName: { 
        type: String
      },
      endPoint: { 
        type: String
      },
      add: { 
        type: Boolean, default: false
      },
      view: { 
        type: Boolean, default: false
      },
      modify: { 
        type: Boolean, default: false
      },
      delete: { 
        type: Boolean, default: false
      },
    }]
  },
  { timestamps: true }
);


export default mongoose.model<IPermission>("permission", PermissionSchema);
