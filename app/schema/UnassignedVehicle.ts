import mongoose, { type Types } from "mongoose";
import { type BaseSchema } from "./index";
import { IVehicle } from "./Vehicle";

const Schema = mongoose.Schema;

export interface IUnassignedVehicl extends BaseSchema {
  imeiNumber: string;
  Vehicle_Name: string;
  Vehicle_No: string;
  Vehicletype: string;
  DeviceModel: string;
}

const UnassignedVehiclSchema = new Schema<IUnassignedVehicl>(
  {
    imeiNumber: {type : String},
    Vehicle_Name: {type : String},
    Vehicle_No: {type : String},
    Vehicletype: {type : String},
    DeviceModel: {type : String},
  },
  { timestamps: true }
);

export default mongoose.model<IUnassignedVehicl>("unassigned-vehicl", UnassignedVehiclSchema);