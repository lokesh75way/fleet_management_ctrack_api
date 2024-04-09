import mongoose, { type Types } from "mongoose";
import { type BaseSchema } from "./index";
import { IVehicle } from "./Vehicle";

const Schema = mongoose.Schema;

export enum GpsDeviceType {
    TELTONIKA = "TELTONIKA",
    JT701 = "JT701",
}

export interface ITrakingHistoryOld extends BaseSchema {
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
  other : {
    gpsTime: string,
    locationType: number,
    sensorID: string,
    lockStatus: number,
    lockRope: number,
    lockTimes: number,
    index: string,
    voltage: number,
    power: string,
    RSSI: string,
    SensorType: number,
    Temperature: number,
    Humidity: string,
    event: string,
    vehicleID:number,
    protocolType:number,
    deviceType: number,
    dataType: number,
    dataLength: number,
    mileage: number,
    gpsSignal: number,
    gsmSignal: number,
    alarmArea: number,
    battery: number,
    backCover: number,
    mcc: number,
    mnc: number,
    lac: number,
    cellID: number,
    alarm:  number,
    rfidNo: string,
    status: string,
    psdErrorTimes: number,
    unlockFenceID: number,
  }
}

const TrakingHistoryOldSchema = new Schema<ITrakingHistoryOld>(
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
    direction: { type: Number },
    slNo: { type: Number },
    other: {
      gpsTime: { type: String },
      fuel: { type: Array },
      locationType: { type: Number },
      sensorID: { type: String },
      lockStatus: { type: Number },
      lockRope: { type: Number },
      lockTimes: { type: Number },
      index: { type: String },
      voltage: { type: Number },
      power: { type: String },
      RSSI: { type: String },
      SensorType: { type: Number },
      Temperature: { type: Number },
      Humidity: { type: String },
      event: { type: String },
      vehicleID: { type: Number },
      protocolType: { type: Number },
      deviceType: { type: Number },
      dataType: { type: Number },
      dataLength: { type: Number },
      mileage: { type: Number },
      gpsSignal: { type: Number },
      gsmSignal: { type: Number },
      alarmArea: { type: Number },
      battery: { type: Number },
      backCover: { type: Number },
      mcc: { type: Number },
      mnc: { type: Number },
      lac: { type: Number },
      cellID: { type: Number },
      alarm: { type: Number },
      rfidNo: { type: String },
      status: { type: String },
      psdErrorTimes: { type: Number },
      unlockFenceID: { type: Number },
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITrakingHistoryOld>("tracking-history-old", TrakingHistoryOldSchema);