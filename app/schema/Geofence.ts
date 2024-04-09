import mongoose, { Schema, Types } from "mongoose";
import { BaseSchema } from ".";

import MongooseDelete from "mongoose-delete";
import { ICompany } from "./Company";
import GeoFenceLocation from "./GeofenceLocation";
import { IUser } from "./User";

export enum CATEGORY {
  STAY_AWAY = "STAY_AWAY",
  STAY_IN = "STAY_IN",
  AREA = "AREA",
}

export enum GEOFENCE_ACCESS {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

export enum GEOFENCE_TYPE {
  Point = "Point",
  Line = "LineString",
  Polygon = "Polygon",
  Circle = "Circle",
}

export interface IGeofence extends BaseSchema {
  company: Types.ObjectId | ICompany;
  name: string;
  category: CATEGORY;
  geofenceAccess: GEOFENCE_ACCESS;
  contactNumber: number;
  address: string;
  tolerance: number;
  description: string;
  location: {
    type: GEOFENCE_TYPE;
    coordinates: any;
    duration? : number
  };
  createdBy : Types.ObjectId | IUser
}

const GeoFenceSchema = new Schema<IGeofence>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "company",
      required: true,
    },
    contactNumber :{
      type : 'Number',
      required : true
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(CATEGORY),
      required: true,
    },
    geofenceAccess: {
      type: String,
      enum: Object.values(GEOFENCE_ACCESS),
    },
    address: {
      type: String,
    },
    tolerance: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    location: [{
      type: GeoFenceLocation.schema,
      required: true
    }],
    createdBy : {
        type : Schema.Types.ObjectId,
        ref : "user"
    }
  },
  {
    timestamps: true,
  }
);

GeoFenceSchema.plugin(MongooseDelete, {
  deletedBy: true,
  deletedByType: String,
});

export default mongoose.model<IGeofence>("geofence", GeoFenceSchema);
