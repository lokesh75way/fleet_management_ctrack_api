import mongoose, { type Types } from "mongoose";
import { type BaseSchema } from "./index";
import { IVehicle } from "./Vehicle";

const Schema = mongoose.Schema;

export interface ITrakingHistory extends BaseSchema {
  vehicleId: Types.ObjectId | IVehicle;
  Vehicle_Name: string;
  Company: string;
  Temperature: string;
  Latitude: string;
  GPS: string;
  Vehicle_No: string;
  Door1: string;
  Door4: string;
  Branch: string;
  Vehicletype: string;
  Door2: string;
  Door3: string;
  GPSActualTime: string;
  Datetime: string;
  Status: string;
  DeviceModel: string;
  Speed: string;
  AC: string;
  imeiNumber: string;
  Odometer: string;
  POI: string;
  Driver_Middle_Name: string;
  Longitude: string;
  Immobilize_State: string;
  IGN: string;
  Driver_First_Name: string;
  Angle: string;
  SOS: string;
  Fuel: number[];
  battery_percentage: string;
  ExternalVolt: string;
  Driver_Last_Name: string;
  Power: string;
  Location: string;
}

const TrakingHistorySchema = new Schema<ITrakingHistory>(
  {
    vehicleId: {
      type: mongoose.Types.ObjectId,
      ref: "vehicle",
    },
    Vehicle_Name: {type : String},
    Company: {type : String},
    Temperature: {type : String},
    Latitude: {type : String},
    GPS: {type : String},
    Vehicle_No: {type : String},
    Door1: {type : String},
    Door4: {type : String},
    Branch: {type : String},
    Vehicletype: {type : String},
    Door2: {type : String},
    Door3: {type : String},
    GPSActualTime: {type : String},
    Datetime: {type : String},
    Status: {type : String},
    DeviceModel: {type : String},
    Speed: {type : String},
    AC: {type : String},
    imeiNumber: {type : String},
    Odometer: {type : String},
    POI: {type : String},
    Driver_Middle_Name: {type : String},
    Longitude: {type : String},
    Immobilize_State: {type : String},
    IGN: {type : String},
    Driver_First_Name: {type : String},
    Angle: {type : String},
    SOS: {type : String},
    Fuel: {type: [Number]},
    battery_percentage: {type : String},
    ExternalVolt: {type : String},
    Driver_Last_Name: {type : String},
    Power: {type : String},
    Location: {type : String},
  },
  { timestamps: true }
);

export default mongoose.model<ITrakingHistory>("tracking-history", TrakingHistorySchema);