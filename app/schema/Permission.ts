import mongoose, { type Types } from "mongoose";
import { type BaseSchema } from "./index";
import { IUser } from "./User";
import { IModule } from "./Module";

const Schema = mongoose.Schema;

export interface IPermission extends BaseSchema {
  name: string;
  permission: {
    moduleId: Types.ObjectId | IModule;
    endPoint: string;
    add: boolean;
    view: boolean;
    modify: boolean;
    delete: boolean;
  }[]
}

const PermissionSchema = new Schema<IPermission>(
  {
    name: { 
      type: String
    },
    permission: [{
      moduleId: { 
        type: mongoose.Types.ObjectId,
        ref: "module"
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
