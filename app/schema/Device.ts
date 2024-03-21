import mongoose, { Schema } from "mongoose";
import { type BaseSchema } from "./index";

interface IDevice extends BaseSchema {
  deviceName: String;
}

const DeviceSchema = new Schema<IDevice>(
  {
    deviceName: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('device', DeviceSchema);