import mongoose, { type Types } from "mongoose";
import { type BaseSchema } from "./index";
import { IVehicle } from "./Vehicle";

const Schema = mongoose.Schema;

export enum GpsDeviceType {
    TELTONIKA = "TELTONIKA",
    JT701 = "JT701",
}

export interface ITrakingHistory extends BaseSchema {
  deviceType: GpsDeviceType;
  vehicleId: Types.ObjectId | IVehicle;
  imeiNumber: string;
  dateTime: Date;
  lattitude: number;
  longitude: number;
  priority: number;
  altitude: number;
  angle: number;
  satellites: number;
  speed: number;
  ioElement: {
    eventID: number;
    elementCount: number;
    elements: object;
  };
  tag: string;
  positionFixIndicator: string;
  direction : number;
  slNo : number;
}

const TrakingHistorySchema = new Schema<ITrakingHistory>(
  {
    deviceType: { type: String, enum: GpsDeviceType },
    vehicleId: {
      type: mongoose.Types.ObjectId,
      ref: "vehicle",
    },
    imeiNumber: { type: String, required: true },
    dateTime: { type: Date },
    lattitude: { type: Number },
    longitude: { type: Number },
    priority: { type: Number },
    altitude: { type: Number },
    angle: { type: Number },
    satellites: { type: Number },
    speed: { type: Number },
    ioElement: {
        eventID: { type: Number },
        elementCount: { type: Number },
        elements: { type: Object },
    },
    tag: { type: String},
    positionFixIndicator: { type: String},
    direction : { type: Number },
    slNo : { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model<ITrakingHistory>("tracking-history", TrakingHistorySchema);