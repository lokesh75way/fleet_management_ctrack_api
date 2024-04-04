import mongoose from "mongoose";
import { type BaseSchema } from "./index";

const Schema = mongoose.Schema;

export interface IDeviceLogs extends BaseSchema {
  packets: string;
  others: object;
}

const DeviceLogSchema = new Schema<IDeviceLogs>(
  {
    packets: { type: String },
    others: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.model<IDeviceLogs>("device-log", DeviceLogSchema);
