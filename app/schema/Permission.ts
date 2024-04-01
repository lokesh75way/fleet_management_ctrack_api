import mongoose, { type Types } from "mongoose";
import { type BaseSchema } from "./index";
import  MongooseDelete , { SoftDeleteModel }  from 'mongoose-delete';
const Schema = mongoose.Schema;

export interface IPermission extends BaseSchema {
  name: string;
  permission: {
    moduleId: Types.ObjectId ;
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
        ref: "modules",
        required : false
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



PermissionSchema.plugin(MongooseDelete, {deletedBy : true , deletedByType : String})



export default mongoose.model<IPermission>("permission", PermissionSchema) as SoftDeleteModel<any, any>;
